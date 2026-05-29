"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";

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

type EditGroup = {
  title: string;
  description?: string;
  commands: { id: string; label: string; hint?: string }[];
};

const AI_EDIT_GROUPS: EditGroup[] = [
  {
    title: "Length",
    description: "Trim without losing your take",
    commands: [
      { id: "shortenLight", label: "Trim lightly", hint: "~50–80 words" },
      { id: "shorten100", label: "Shorter", hint: "~100 words" },
      { id: "shortenHeavy", label: "Much shorter", hint: "~300–400 words" },
    ],
  },
  {
    title: "Voice & tone",
    commands: [
      { id: "rewrite", label: "Rewrite" },
      { id: "lessDramatic", label: "Less dramatic" },
      { id: "moreTechnical", label: "More technical" },
      { id: "founderFraming", label: "Personal angle" },
    ],
  },
  {
    title: "Structure",
    commands: [
      { id: "strongerHook", label: "Stronger opening" },
      { id: "clearerExplanation", label: "Clearer" },
      { id: "addAnalogy", label: "Add analogy" },
      { id: "improveEnding", label: "Better ending" },
    ],
  },
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

/** Wait this long after the last keystroke before auto-saving. */
const AUTOSAVE_DEBOUNCE_MS = 15_000;

function AiEditsPanel({
  idle,
  customEdit,
  onCustomChange,
  onRun,
}: {
  idle: boolean;
  customEdit: string;
  onCustomChange: (v: string) => void;
  onRun: (command: string) => void;
}) {
  return (
    <Card className="shadow-pill">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-brand" />
          <CardTitle className="text-base">AI edits</CardTitle>
        </div>
        <CardDescription>
          Applies to the post body above - uses your writing-style knowledge
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {AI_EDIT_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.title}
            </p>
            {group.description ? (
              <p className="mb-2 text-xs text-muted-foreground">
                {group.description}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {group.commands.map((cmd) => (
                <Button
                  key={cmd.id}
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!idle}
                  className="h-auto min-h-8 flex-col items-start gap-0 px-3 py-1.5 text-left sm:flex-row sm:items-center sm:gap-2"
                  onClick={() => onRun(cmd.id)}
                >
                  <span>{cmd.label}</span>
                  {cmd.hint ? (
                    <span className="text-[10px] font-normal text-muted-foreground sm:text-xs">
                      {cmd.hint}
                    </span>
                  ) : null}
                </Button>
              ))}
            </div>
          </div>
        ))}

        <div className="grid gap-2 border-t border-subtle pt-4">
          <Label htmlFor="custom-edit">Custom instruction</Label>
          <Textarea
            id="custom-edit"
            value={customEdit}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder='e.g. "Make the second paragraph punchier for X"'
            className="min-h-[64px] text-sm"
          />
          <Button
            type="button"
            variant="brandOutline"
            disabled={!idle || !customEdit.trim()}
            className="gap-1 self-start"
            onClick={() => onRun("custom")}
          >
            <Send className="size-4" />
            Apply custom edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HookCtaPanel({
  draft,
  hookIx,
  ctaIx,
  onHookChange,
  onCtaChange,
  compact = false,
}: {
  draft: DraftPayload;
  hookIx: number;
  ctaIx: number;
  onHookChange: (i: number) => void;
  onCtaChange: (i: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-4", compact && "gap-3")}>
      <Card className={cn("shadow-pill", compact && "shadow-none")}>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className={cn("text-base", compact && "text-sm")}>
            Opening hook
          </CardTitle>
          {!compact ? (
            <CardDescription>Prepended when you copy the full post</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pb-4">
          {draft.hookVariants.length === 0 ? (
            <p className="text-xs text-muted-foreground">No hooks generated.</p>
          ) : (
            draft.hookVariants.map((h, i) => (
              <label
                key={`hook-${i}`}
                className={cn(
                  "flex cursor-pointer gap-2 rounded-lg border px-2.5 py-2 text-sm transition-colors",
                  hookIx === i
                    ? "border-brand bg-brand/5"
                    : "border-border/70 bg-card/80",
                  compact && "text-xs",
                )}
              >
                <input
                  type="radio"
                  name="hook"
                  checked={hookIx === i}
                  onChange={() => onHookChange(i)}
                  className="mt-0.5 shrink-0"
                />
                <span className="leading-snug">{h}</span>
              </label>
            ))
          )}
        </CardContent>
      </Card>

      <Card className={cn("shadow-pill", compact && "shadow-none")}>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className={cn("text-base", compact && "text-sm")}>
            Closing line
          </CardTitle>
          {!compact ? (
            <CardDescription>Appended after the body when copying</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pb-4">
          {draft.ctaVariants.length === 0 ? (
            <p className="text-xs text-muted-foreground">No CTAs generated.</p>
          ) : (
            draft.ctaVariants.map((c, i) => (
              <label
                key={`cta-${i}`}
                className={cn(
                  "flex cursor-pointer gap-2 rounded-lg border px-2.5 py-2 text-sm transition-colors",
                  ctaIx === i
                    ? "border-brand bg-brand/5"
                    : "border-border/70 bg-card/80",
                  compact && "text-xs",
                )}
              >
                <input
                  type="radio"
                  name="cta"
                  checked={ctaIx === i}
                  onChange={() => onCtaChange(i)}
                  className="mt-0.5 shrink-0"
                />
                <span className="leading-snug">{c}</span>
              </label>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DraftWorkspace({ draftId }: { draftId: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [hookIx, setHookIx] = useState(0);
  const [ctaIx, setCtaIx] = useState(0);
  const [busy, setBusy] = useState<"idle" | "load" | "edit" | "publish">(
    "load",
  );
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [customEdit, setCustomEdit] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [assembleOpen, setAssembleOpen] = useState(false);
  const saveInFlight = useRef(false);
  const latestDraftRef = useRef<DraftPayload | null>(null);
  const latestContentRef = useRef("");
  const latestHookIxRef = useRef(0);
  const latestCtaIxRef = useRef(0);

  const blocksEditing = busy === "load" || busy === "edit";

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
      setSaveState("saved");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Load error");
    } finally {
      setBusy("idle");
    }
  }, [draftId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    latestDraftRef.current = draft;
    latestContentRef.current = content;
    latestHookIxRef.current = hookIx;
    latestCtaIxRef.current = ctaIx;
  }, [draft, content, hookIx, ctaIx]);

  const saveBody = useCallback(
    async (silent = false): Promise<void> => {
      const currentDraft = latestDraftRef.current;
      const body = latestContentRef.current;
      const hook = latestHookIxRef.current;
      const cta = latestCtaIxRef.current;

      if (!currentDraft || saveInFlight.current) return;
      if (!hasUnsavedChanges(currentDraft, body, hook, cta)) return;

      saveInFlight.current = true;
      setSaveState("saving");
      if (!silent) setToast(null);
      try {
        const res = await fetch(`/api/draft/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentContent: body,
            selectedHook: hook,
            selectedCta: cta,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
        const updated = (await res.json()) as DraftPayload;
        setDraft(updated);
        setSaveState("saved");
        if (!silent) setToast("Saved.");
      } catch {
        setSaveState("error");
        if (!silent) setToast("Could not save.");
      } finally {
        saveInFlight.current = false;
      }
    },
    [draftId],
  );

  useEffect(() => {
    if (!draft || busy !== "idle") return;
    if (!hasUnsavedChanges(draft, content, hookIx, ctaIx)) return;

    const timer = window.setTimeout(() => {
      void saveBody(true);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [draft, content, hookIx, ctaIx, busy, saveBody]);

  useEffect(() => {
    function flushOnHide() {
      if (document.visibilityState !== "hidden") return;
      const currentDraft = latestDraftRef.current;
      if (!currentDraft || saveInFlight.current) return;
      if (
        !hasUnsavedChanges(
          currentDraft,
          latestContentRef.current,
          latestHookIxRef.current,
          latestCtaIxRef.current,
        )
      ) {
        return;
      }
      void saveBody(true);
    }

    document.addEventListener("visibilitychange", flushOnHide);
    return () => document.removeEventListener("visibilitychange", flushOnHide);
  }, [saveBody]);

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
      setToast("Edit applied.");
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
    setToast("Copied - hook + body + closing line.");
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
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const isDirty = draft
    ? hasUnsavedChanges(draft, content, hookIx, ctaIx)
    : false;

  const saveStatusLabel = isDirty
    ? saveState === "saving"
      ? "Saving in background…"
      : "Unsaved changes"
    : saveState === "saving"
      ? "Saving…"
      : saveState === "error"
        ? "Save failed — use Save draft"
        : "Saved";

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

  const actionButtons = (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        disabled={busy !== "idle" || saveState === "saving"}
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
        Copy full post
      </Button>
      <Button
        type="button"
        disabled={busy !== "idle" || draft.status === "published"}
        onClick={() => void publish()}
      >
        Mark as published
      </Button>
    </div>
  );

  return (
    <div className="pb-24 lg:pb-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="size-4" />
            Topics
          </Button>
        </Link>
        <DraftStatusBadge status={draft.status} />
        {isDirty || saveState !== "saved" ? (
          <span
            className={cn(
              "text-xs",
              saveState === "error"
                ? "text-red-600"
                : "text-muted-foreground",
            )}
          >
            {saveStatusLabel}
          </span>
        ) : (
          <span className="text-xs text-brand">{saveStatusLabel}</span>
        )}
      </div>

      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg font-semibold tracking-tight sm:text-2xl">
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-8">
        {/* Primary column - body, actions, AI edits */}
        <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
          <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="body" className="text-base font-semibold">
                Post body
              </Label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {wordCount} words · {charCount} chars
              </span>
            </div>
            <Textarea
              id="body"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (saveState === "saved") setSaveState("idle");
              }}
              disabled={blocksEditing}
              className="min-h-[min(50vh,420px)] resize-y text-[15px] leading-relaxed sm:min-h-[360px] sm:text-base lg:min-h-[400px]"
            />
          </div>

          {actionButtons}

          {busy === "edit" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Applying AI edit…
            </div>
          ) : null}

          <AiEditsPanel
            idle={busy === "idle" && saveState !== "saving"}
            customEdit={customEdit}
            onCustomChange={setCustomEdit}
            onRun={(cmd) => void runEdit(cmd)}
          />

          {/* Mobile: hook/CTA collapsed below the fold */}
          <div className="xl:hidden">
            <button
              type="button"
              onClick={() => setAssembleOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-subtle bg-muted/30 px-4 py-3 text-left text-sm font-medium"
            >
              <span>Hook & closing line</span>
              <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                Optional for copy
                {assembleOpen ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </span>
            </button>
            {assembleOpen ? (
              <div className="mt-3 rounded-xl border border-subtle bg-card/50 p-3">
                <HookCtaPanel
                  draft={draft}
                  hookIx={hookIx}
                  ctaIx={ctaIx}
                  onHookChange={setHookIx}
                  onCtaChange={setCtaIx}
                  compact
                />
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                    Preview full post
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-xs leading-relaxed">
                    {assembledPreview}
                  </pre>
                </details>
              </div>
            ) : null}
          </div>
        </div>

        {/* Sidebar - hook, CTA, preview (desktop only) */}
        <aside className="hidden flex-col gap-4 xl:flex">
          <HookCtaPanel
            draft={draft}
            hookIx={hookIx}
            ctaIx={ctaIx}
            onHookChange={setHookIx}
            onCtaChange={setCtaIx}
          />
          <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Full post preview</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-foreground">
                {assembledPreview}
              </pre>
            </CardContent>
          </Card>
          {draft.sources.length > 0 ? (
            <Card className="shadow-pill">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Sources</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-xs">
                {draft.sources.map((s) => (
                  <a
                    key={s}
                    href={s}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-brand underline-offset-4 hover:underline"
                  >
                    {s}
                  </a>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-subtle bg-background/95 px-4 py-2.5 backdrop-blur-sm xl:hidden">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex-1"
            disabled={busy !== "idle" || saveState === "saving"}
            onClick={() => void saveBody()}
          >
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            disabled={busy !== "idle"}
            onClick={() => void copyAssembled()}
          >
            <Copy className="size-3.5" />
            Copy
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1"
            disabled={busy !== "idle" || draft.status === "published"}
            onClick={() => void publish()}
          >
            Publish
          </Button>
        </div>
      </div>

      {toast ? (
        <p
          className="fixed bottom-16 left-4 right-4 z-30 rounded-lg border border-subtle bg-card px-3 py-2 text-center text-sm shadow-pill xl:static xl:mt-4 xl:border-0 xl:bg-transparent xl:p-0 xl:text-left xl:shadow-none"
          role="status"
        >
          {toast}
        </p>
      ) : null}
    </div>
  );
}
