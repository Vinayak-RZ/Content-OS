"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Loader2, Send } from "lucide-react";

import { DraftStatusBadge } from "@/components/ui/draft-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DraftPayload = {
  id: string;
  topicTitle: string;
  currentContent: string;
  hookVariants: string[];
  ctaVariants: string[];
  selectedHook: number;
  selectedCta: number;
  status: string;
  sources: string[];
  trend: { url: string; title: string } | null;
};

const EDIT_COMMANDS = [
  ["shorten", "Shorten"],
  ["rewrite", "Rewrite"],
  ["strongerHook", "Stronger hook"],
  ["moreTechnical", "More technical"],
  ["lessDramatic", "Less dramatic"],
  ["founderFraming", "Founder angle"],
  ["clearerExplanation", "Clearer"],
  ["addAnalogy", "Add analogy"],
  ["improveEnding", "Better ending"],
] as const;

function assemblePost(d: DraftPayload): string {
  const hook = d.hookVariants[d.selectedHook] ?? "";
  const cta = d.ctaVariants[d.selectedCta] ?? "";
  return `${hook}\n\n${d.currentContent}\n\n${cta}`.trim();
}

export function DraftWorkspace({ draftId }: { draftId: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [hookIx, setHookIx] = useState(0);
  const [ctaIx, setCtaIx] = useState(0);
  const [busy, setBusy] = useState<
    "idle" | "load" | "save" | "edit" | "publish"
  >("idle");
  const [customEdit, setCustomEdit] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy("load");
    setLoadError(null);
    try {
      const res = await fetch(`/api/draft/${draftId}`);
      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof json === "object" &&
          json &&
          "error" in json &&
          typeof (json as { error?: string }).error === "string"
            ? (json as { error: string }).error
            : "Failed to load draft";
        throw new Error(msg);
      }
      const d = json as DraftPayload;
      setDraft(d);
      setContent(d.currentContent);
      setHookIx(d.selectedHook);
      setCtaIx(d.selectedCta);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Load error");
    } finally {
      setBusy("idle");
    }
  }, [draftId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveBody(): Promise<void> {
    if (!draft) return;
    setBusy("save");
    setToast(null);
    try {
      const res = await fetch(`/api/draft/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentContent: content,
          selectedHook: hookIx,
          selectedCta: ctaIx,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = (await res.json()) as DraftPayload;
      setDraft(updated);
      setToast("Saved.");
    } catch {
      setToast("Could not save.");
    } finally {
      setBusy("idle");
    }
  }

  async function runEdit(command: string): Promise<void> {
    if (!draft) return;
    setBusy("edit");
    setToast(null);
    try {
      const res = await fetch(`/api/draft/${draftId}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          customInstruction:
            command === "custom" ? customEdit.trim() : undefined,
        }),
      });
      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof json === "object" &&
          json &&
          "error" in json &&
          typeof (json as { error?: string }).error === "string"
            ? (json as { error: string }).error
            : "Edit failed";
        throw new Error(msg);
      }
      const body = json as { draft: DraftPayload };
      setDraft(body.draft);
      setContent(body.draft.currentContent);
      setToast("Edited.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Edit failed");
    } finally {
      setBusy("idle");
    }
  }

  async function publish(): Promise<void> {
    setBusy("publish");
    setToast(null);
    try {
      const res = await fetch(`/api/draft/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      if (!res.ok) throw new Error("Publish failed");
      const updated = (await res.json()) as DraftPayload;
      setDraft(updated);
      setToast("Marked as published.");
      router.refresh();
    } catch {
      setToast("Could not publish.");
    } finally {
      setBusy("idle");
    }
  }

  async function copyAssembled(): Promise<void> {
    if (!draft) return;
    const text = assemblePost({
      ...draft,
      currentContent: content,
      selectedHook: hookIx,
      selectedCta: ctaIx,
    });
    await navigator.clipboard.writeText(text);
    setToast("Copied assembled post.");
  }

  const assembledPreview = useMemo(() => {
    if (!draft) return "";
    return assemblePost({
      ...draft,
      currentContent: content,
      selectedHook: hookIx,
      selectedCta: ctaIx,
    });
  }, [draft, content, hookIx, ctaIx]);

  const charCount = content.length;

  if (loadError) {
    return (
      <Card className="max-w-lg border-destructive/40">
        <CardHeader>
          <CardTitle>Draft unavailable</CardTitle>
          <CardDescription>{loadError}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard">
            <Button variant="outline">Back</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!draft || busy === "load") {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Loading draft…
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              Topics
            </Button>
          </Link>
          <DraftStatusBadge status={draft.status} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {draft.topicTitle}
          </h1>
          {draft.trend?.url ? (
            <a
              href={draft.trend.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-brand underline-offset-4 hover:underline"
            >
              Source
            </a>
          ) : null}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="body">Post body</Label>
            <span className="text-xs text-muted-foreground">{charCount} chars</span>
          </div>
          <Textarea
            id="body"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[320px] font-[inherit] leading-relaxed"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={busy !== "idle"}
              onClick={() => void saveBody()}
            >
              Save draft
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== "idle"}
              onClick={() => void copyAssembled()}
              className="gap-1"
            >
              <Copy className="size-4" />
              Copy assembled
            </Button>
            <Button
              type="button"
              disabled={busy !== "idle" || draft.status === "published"}
              onClick={() => void publish()}
            >
              Mark as published
            </Button>
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-5">
        <Card className="shadow-pill">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Hooks</CardTitle>
            <CardDescription>Opening line variants</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {draft.hookVariants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hook variants were returned — regenerate if needed.
              </p>
            ) : (
              draft.hookVariants.map((h, i) => (
                <label
                  key={`hook-${i}`}
                  className="flex cursor-pointer gap-2 rounded-xl border border-border/70 bg-card/80 px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    name="hook"
                    checked={hookIx === i}
                    onChange={() => setHookIx(i)}
                    className="mt-1"
                  />
                  <span>{h}</span>
                </label>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-pill">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">CTAs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {draft.ctaVariants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No CTAs returned.</p>
            ) : (
              draft.ctaVariants.map((c, i) => (
                <label
                  key={`cta-${i}`}
                  className="flex cursor-pointer gap-2 rounded-xl border border-border/70 bg-card/80 px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    name="cta"
                    checked={ctaIx === i}
                    onChange={() => setCtaIx(i)}
                    className="mt-1"
                  />
                  <span>{c}</span>
                </label>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-pill">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">AI edits</CardTitle>
            <CardDescription>Uses your writing-style chunks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {EDIT_COMMANDS.map(([id, label]) => (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy !== "idle"}
                  onClick={() => void runEdit(id)}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="custom-edit">Custom instruction</Label>
              <Textarea
                id="custom-edit"
                value={customEdit}
                onChange={(e) => setCustomEdit(e.target.value)}
                className="min-h-[72px] text-sm"
              />
              <Button
                type="button"
                variant="brandOutline"
                disabled={busy !== "idle" || !customEdit.trim()}
                className="gap-1"
                onClick={() => void runEdit("custom")}
              >
                <Send className="size-4" />
                Apply custom
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-pill">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sources</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {draft.sources.length ? (
              draft.sources.map((s) => (
                <a
                  key={s}
                  href={s}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-brand underline-offset-4 hover:underline"
                >
                  {s}
                </a>
              ))
            ) : (
              <span className="text-muted-foreground">None linked</span>
            )}
          </CardContent>
        </Card>

        <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-card p-3 text-xs text-muted-foreground">
              {assembledPreview}
            </pre>
          </CardContent>
        </Card>

        {toast ? (
          <p className="text-sm text-muted-foreground" role="status">
            {toast}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
