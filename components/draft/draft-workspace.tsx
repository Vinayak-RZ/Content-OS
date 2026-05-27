"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";

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

type MobileTab = "write" | "assemble" | "refine";

const EDIT_COMMANDS = [
  ["shorten", "Shorten"],
  ["rewrite", "Rewrite"],
  ["strongerHook", "Stronger hook"],
  ["moreTechnical", "More technical"],
  ["lessDramatic", "Less dramatic"],
  ["founderFraming", "Personal angle"],
  ["clearerExplanation", "Clearer"],
  ["addAnalogy", "Add analogy"],
  ["improveEnding", "Better ending"],
] as const;

const MOBILE_TABS: { id: MobileTab; label: string }[] = [
  { id: "write", label: "Write" },
  { id: "assemble", label: "Assemble" },
  { id: "refine", label: "Refine" },
];

function assemblePost(d: DraftPayload): string {
  const hook = d.hookVariants[d.selectedHook] ?? "";
  const cta = d.ctaVariants[d.selectedCta] ?? "";
  return `${hook}\n\n${d.currentContent}\n\n${cta}`.trim();
}

function hasUnsavedChanges(
  draft: DraftPayload,
  content: string,
  hookIx: number,
  ctaIx: number,
): boolean {
  return (
    content !== draft.currentContent ||
    hookIx !== draft.selectedHook ||
    ctaIx !== draft.selectedCta
  );
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
  const [mobileTab, setMobileTab] = useState<MobileTab>("write");
  const saveInFlight = useRef(false);

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

  const saveBody = useCallback(
    async (silent = false): Promise<void> => {
      if (!draft || saveInFlight.current) return;
      if (!hasUnsavedChanges(draft, content, hookIx, ctaIx)) return;

      saveInFlight.current = true;
      setBusy("save");
      if (!silent) setToast(null);
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
        if (!silent) setToast("Saved.");
      } catch {
        if (!silent) setToast("Could not save.");
      } finally {
        saveInFlight.current = false;
        setBusy("idle");
      }
    },
    [draft, content, hookIx, ctaIx, draftId],
  );

  useEffect(() => {
    if (!draft || busy === "load") return;
    if (!hasUnsavedChanges(draft, content, hookIx, ctaIx)) return;

    const timer = window.setTimeout(() => {
      void saveBody(true);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [draft, content, hookIx, ctaIx, busy, saveBody]);

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
      if (draft && hasUnsavedChanges(draft, content, hookIx, ctaIx)) {
        await saveBody(true);
      }
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
    setToast("Copied — ready to paste on LinkedIn or X.");
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
  const isDirty = draft
    ? hasUnsavedChanges(draft, content, hookIx, ctaIx)
    : false;

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

  const writePanel = (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-subtle bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">How it works:</span>{" "}
          Pick a hook and CTA in{" "}
          <button
            type="button"
            className="font-medium text-brand underline-offset-4 hover:underline lg:pointer-events-none lg:no-underline"
            onClick={() => setMobileTab("assemble")}
          >
            Assemble
          </button>
          , edit the body here, then copy the full post when ready.
        </p>
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
          className="min-h-[240px] font-[inherit] leading-relaxed sm:min-h-[320px]"
        />
      </div>

      <div className="hidden flex-wrap gap-2 lg:flex">
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
          Copy for LinkedIn / X
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
  );

  const assemblePanel = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-brand">
          1 · Hook
        </span>
        <span aria-hidden>→</span>
        <span className="rounded-full bg-muted px-2.5 py-1">2 · Body</span>
        <span aria-hidden>→</span>
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-brand">
          3 · CTA
        </span>
      </div>

      <Card className="shadow-pill">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Hooks</CardTitle>
          <CardDescription>Opening line — shown first in the assembled post</CardDescription>
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
                className={cn(
                  "flex cursor-pointer gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                  hookIx === i
                    ? "border-brand bg-brand/5"
                    : "border-border/70 bg-card/80",
                )}
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
          <CardDescription>Closing line — appended after the body</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {draft.ctaVariants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No CTAs returned.</p>
          ) : (
            draft.ctaVariants.map((c, i) => (
              <label
                key={`cta-${i}`}
                className={cn(
                  "flex cursor-pointer gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                  ctaIx === i
                    ? "border-brand bg-brand/5"
                    : "border-border/70 bg-card/80",
                )}
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

      <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Live preview</CardTitle>
          <CardDescription>Hook + body + CTA combined</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-card p-3 text-sm leading-relaxed text-foreground">
            {assembledPreview}
          </pre>
        </CardContent>
      </Card>
    </div>
  );

  const refinePanel = (
    <div className="flex flex-col gap-5">
      <Card className="shadow-pill">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">AI edits</CardTitle>
          <CardDescription>Quick transforms using your writing-style knowledge</CardDescription>
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
              placeholder="e.g. Make the opening more provocative for X"
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
    </div>
  );

  return (
    <div className="pb-20 lg:pb-0">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="size-4" />
            Topics
          </Button>
        </Link>
        <DraftStatusBadge status={draft.status} />
        {isDirty ? (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        ) : busy === "save" ? (
          <span className="text-xs text-muted-foreground">Saving…</span>
        ) : (
          <span className="text-xs text-brand">All changes saved</span>
        )}
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {draft.topicTitle}
        </h1>
        {draft.trend?.url ? (
          <a
            href={draft.trend.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-brand underline-offset-4 hover:underline"
          >
            View source
          </a>
        ) : null}
      </div>

      {/* Mobile tabs */}
      <div
        className="mb-4 flex gap-1 rounded-xl border border-subtle bg-muted/30 p-1 lg:hidden"
        role="tablist"
        aria-label="Draft sections"
      >
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mobileTab === tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              mobileTab === tab.id
                ? "bg-card text-foreground shadow-pill"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:gap-8 xl:grid-cols-[1fr_340px]">
        <div
          className={cn(
            mobileTab !== "write" && "hidden lg:block",
          )}
        >
          {writePanel}
        </div>

        <aside
          className={cn(
            "flex flex-col gap-5",
            mobileTab === "write" && "hidden lg:flex",
          )}
        >
          <div
            className={cn(
              mobileTab !== "assemble" && "hidden lg:block",
            )}
          >
            {assemblePanel}
          </div>
          <div
            className={cn(
              mobileTab !== "refine" && "hidden lg:block",
            )}
          >
            {refinePanel}
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-subtle bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy !== "idle"}
            onClick={() => void saveBody()}
          >
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy !== "idle"}
            onClick={() => void copyAssembled()}
            className="gap-1"
          >
            <Copy className="size-4" />
            Copy
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={busy !== "idle" || draft.status === "published"}
            onClick={() => void publish()}
          >
            Publish
          </Button>
        </div>
      </div>

      {toast ? (
        <p className="mt-3 text-sm text-muted-foreground lg:mt-4" role="status">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
