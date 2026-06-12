"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";

import { DraftPreviewOverlay } from "@/components/draft/draft-preview-overlay";
import { DraftRevisionPanel } from "@/components/draft/draft-revision-panel";
import { DraftXThreadPanel } from "@/components/draft/draft-x-thread-panel";
import type { DraftRevisionEntry } from "@/lib/drafts/revision";
import type { ClientDraftPayload } from "@/lib/drafts/serialize-for-client";

import { DraftStatusBadge } from "@/components/ui/draft-status-badge";
import { Button } from "@/components/ui/button";
import { consumeAppSseStream } from "@/lib/client/app-sse";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";
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

type DraftPayload = ClientDraftPayload & {
  revisions?: DraftRevisionEntry[];
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
  {
    title: "Publish",
    commands: [
      { id: "addHashtags", label: "Add more hashtags", hint: "8 hashtags" },
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
          Applies to the post body above. Each edit is saved to version history
          so you can restore earlier versions.
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

export function DraftWorkspace({
  draftId,
  initialDraft = null,
}: {
  draftId: string;
  initialDraft?: ClientDraftPayload | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showNewDraftBanner = searchParams.get("new") === "1";
  const [draft, setDraft] = useState<DraftPayload | null>(initialDraft);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [content, setContent] = useState(initialDraft?.currentContent ?? "");
  const [hookIx, setHookIx] = useState(initialDraft?.selectedHook ?? 0);
  const [ctaIx, setCtaIx] = useState(initialDraft?.selectedCta ?? 0);
  const [xThreadParts, setXThreadParts] = useState<string[]>(
    initialDraft?.xThreadParts ?? [],
  );
  const [revisions, setRevisions] = useState<DraftRevisionEntry[]>(
    initialDraft?.revisions ?? [],
  );
  const [busy, setBusy] = useState<
    "idle" | "load" | "edit" | "publish" | "xthread" | "delete"
  >(initialDraft ? "idle" : "load");
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >(initialDraft ? "saved" : "idle");
  const [customEdit, setCustomEdit] = useState("");
  const [assembleOpen, setAssembleOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [xThreadExpanded, setXThreadExpanded] = useState(
    (initialDraft?.xThreadParts?.length ?? 0) > 0,
  );
  const saveInFlight = useRef(false);
  const latestDraftRef = useRef<DraftPayload | null>(null);
  const latestContentRef = useRef("");
  const latestHookIxRef = useRef(0);
  const latestCtaIxRef = useRef(0);

  const blocksEditing =
    busy === "load" || busy === "edit" || busy === "xthread" || busy === "delete";

  const load = useCallback(async () => {
    setBusy("load");
    setLoadError(null);
    try {
      const result = await fetchJson<DraftPayload>(`/api/draft/${draftId}`);
      if (!result.ok) throw new Error(result.error);
      const d = result.data;
      setDraft(d);
      setContent(d.currentContent);
      setHookIx(d.selectedHook);
      setCtaIx(d.selectedCta);
      setXThreadParts(d.xThreadParts ?? []);
      setRevisions(d.revisions ?? []);
      setSaveState("saved");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Load error");
    } finally {
      setBusy("idle");
    }
  }, [draftId]);

  useEffect(() => {
    if (initialDraft) return;
    void load();
  }, [load, initialDraft]);

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
      try {
        const result = await fetchJson<DraftPayload>(`/api/draft/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentContent: body,
            selectedHook: hook,
            selectedCta: cta,
          }),
        });
        if (!result.ok) throw new Error(result.error);
        setDraft(result.data);
        setRevisions(result.data.revisions ?? []);
        setSaveState("saved");
        if (!silent) toast("Saved.", "success");
      } catch {
        setSaveState("error");
        if (!silent) toast("Could not save. Check your connection.", "error");
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

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      const currentDraft = latestDraftRef.current;
      if (!currentDraft) return;
      const dirty = hasUnsavedChanges(
        currentDraft,
        latestContentRef.current,
        latestHookIxRef.current,
        latestCtaIxRef.current,
      );
      if (dirty || saveState === "error") {
        event.preventDefault();
        event.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [saveState]);

  async function runEdit(command: string): Promise<void> {
    if (!draft) return;
    setBusy("edit");
    let receivedDelta = false;
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

      const done = await consumeAppSseStream(res, {
        onDelta: (_chunk, accumulated) => {
          receivedDelta = true;
          setContent(accumulated);
        },
      });

      if (done.type !== "done" || !("draft" in done)) {
        throw new Error("Edit finished without a saved draft");
      }

      const body = done.draft as DraftPayload;
      setDraft(body);
      setContent(body.currentContent);
      setSaveState("saved");
      toast("Edit applied.", "success");
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Edit failed", "error");
      if (!receivedDelta && draft) setContent(draft.currentContent);
    } finally {
      setBusy("idle");
    }
  }

  async function publish(): Promise<void> {
    setBusy("publish");
    try {
      if (draft && hasUnsavedChanges(draft, content, hookIx, ctaIx)) {
        await saveBody(true);
      }
      const result = await fetchJson<DraftPayload>(`/api/draft/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      if (!result.ok) throw new Error(result.error);
      setDraft(result.data);
      toast("Marked as published.", "success");
      router.refresh();
    } catch {
      toast("Could not publish. Try again.", "error");
    } finally {
      setBusy("idle");
    }
  }

  async function restoreRevision(revisionId: string): Promise<void> {
    setBusy("edit");
    try {
      const result = await fetchJson<DraftPayload>(`/api/draft/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restoreRevisionId: revisionId }),
      });
      if (!result.ok) throw new Error(result.error);
      const d = result.data;
      setDraft(d);
      setContent(d.currentContent);
      setHookIx(d.selectedHook);
      setCtaIx(d.selectedCta);
      setRevisions(d.revisions ?? []);
      setSaveState("saved");
      toast("Version restored.", "success");
    } catch {
      toast("Could not restore version.", "error");
    } finally {
      setBusy("idle");
    }
  }

  async function generateXThread(): Promise<void> {
    if (!draft) return;
    setBusy("xthread");
    try {
      if (hasUnsavedChanges(draft, content, hookIx, ctaIx)) {
        await saveBody(true);
      }
      const result = await fetchJson<{ xThreadParts: string[] }>(
        `/api/draft/${draftId}/x-thread`,
        { method: "POST" },
      );
      if (!result.ok) throw new Error(result.error);
      setXThreadParts(result.data.xThreadParts);
      setXThreadExpanded(true);
      toast("X thread generated.", "success");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "X thread failed", "error");
    } finally {
      setBusy("idle");
    }
  }

  async function saveXThread(parts: string[]): Promise<void> {
    setXThreadParts(parts);
    try {
      await fetchJson(`/api/draft/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xThreadParts: parts }),
      });
    } catch {
      toast("Could not save X thread edits.", "error");
    }
  }

  async function deleteDraft(): Promise<void> {
    if (
      !window.confirm(
        `Delete "${draft?.topicTitle}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    setBusy("delete");
    try {
      const result = await fetchJson<{ ok: boolean }>(`/api/draft/${draftId}`, {
        method: "DELETE",
      });
      if (!result.ok) throw new Error(result.error);
      toast("Draft deleted.", "success");
      router.push("/drafts");
      router.refresh();
    } catch {
      toast("Could not delete draft.", "error");
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
    toast("Copied - hook + body + closing line.", "success");
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
        ? "Save failed - use Save draft"
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
        onClick={() => setPreviewOpen(true)}
        className="gap-1"
      >
        <Eye className="size-4" />
        Preview
      </Button>
      <Button
        type="button"
        disabled={busy !== "idle" || draft.status === "published"}
        onClick={() => void publish()}
      >
        Mark as published
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={busy !== "idle"}
        className="gap-1 text-destructive hover:text-destructive"
        onClick={() => void deleteDraft()}
      >
        <Trash2 className="size-4" />
        Delete
      </Button>
    </div>
  );

  return (
    <div className="pb-24 lg:pb-4">
      {showNewDraftBanner ? (
        <div className="mb-4 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">Draft ready</p>
          <p className="mt-0.5 text-muted-foreground">
            Keep editing here, or copy the full post when you&apos;re happy with
            it.
          </p>
        </div>
      ) : null}
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
              Streaming AI edit into your draft…
            </div>
          ) : null}

          <AiEditsPanel
            idle={busy === "idle" && saveState !== "saving"}
            customEdit={customEdit}
            onCustomChange={setCustomEdit}
            onRun={(cmd) => void runEdit(cmd)}
          />

          <DraftRevisionPanel
            revisions={revisions}
            currentContent={content}
            disabled={blocksEditing}
            onRestore={(id) => void restoreRevision(id)}
          />

          <DraftXThreadPanel
            parts={xThreadParts}
            disabled={blocksEditing}
            generating={busy === "xthread"}
            defaultExpanded={xThreadExpanded}
            onGenerate={() => void generateXThread()}
            onChange={(parts) => void saveXThread(parts)}
          />

          <div>
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
              </div>
            ) : null}
          </div>

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
        </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-subtle bg-background/95 px-4 py-2.5 backdrop-blur-sm lg:hidden">
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
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1"
            disabled={busy !== "idle" || draft.status === "published"}
            onClick={() => void publish()}
          >
            Mark as published
          </Button>
        </div>
      </div>

      {previewOpen ? (
        <DraftPreviewOverlay
          text={assembledPreview}
          onClose={() => setPreviewOpen(false)}
          onCopy={() => void copyAssembled()}
        />
      ) : null}
    </div>
  );
}
