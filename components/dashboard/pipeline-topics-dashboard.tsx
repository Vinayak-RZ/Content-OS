"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Link2, Loader2 } from "lucide-react";
import { generateDraftStream } from "@/lib/client/generate-draft-stream";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";
import { useAppRouter } from "@/lib/client/use-app-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DiscoveryRunButton } from "@/components/discovery-run-button";
import { BlogPromoBanner } from "@/components/dashboard/blog-promo-banner";
import { FirstRunChecklist } from "@/components/dashboard/first-run-checklist";
import { DraftGenerationOverlay } from "@/components/draft/draft-generation-overlay";
import { KnowledgeEmptyBanner } from "@/components/dashboard/knowledge-empty-banner";
import { TavilySetupBanner } from "@/components/dashboard/tavily-setup-banner";
import { TopicCard } from "@/components/dashboard/topic-card";
import { TopicPickPlaceholder } from "@/components/dashboard/topic-pick-placeholder";
import { TopicPoolTable } from "@/components/dashboard/topic-pool-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  DISCOVERY_NEW_PER_RUN,
  DISCOVERY_VISIBLE_POOL_MAX,
  DISCOVERY_VISIBLE_POOL_MIN,
} from "@/lib/discovery/founder-profile";
import { TOPIC_POOL_TTL_DAYS } from "@/lib/discovery/topic-pool-ttl";
import type { ContentPipeline } from "@/lib/pipelines/types";
import { PIPELINE_UI } from "@/lib/pipelines/ui";
import type { SerializedDashboardTrend } from "@/lib/trends/types";

export function PipelineTopicsDashboard({
  pipeline,
  initialTrends,
  lastRun,
  visiblePoolCount,
  latestBatchId,
  showKnowledgeBanner = false,
  showTavilyBanner = false,
  showFirstRunChecklist = false,
  knowledgeFilled = true,
  draftCount = 0,
  hasDiscoveryKey = false,
  hasAnyDraftKey = false,
}: {
  pipeline: ContentPipeline;
  initialTrends: SerializedDashboardTrend[];
  lastRun: {
    runAt: string;
    success: boolean;
    totalDiscovered: number;
  } | null;
  visiblePoolCount: number;
  latestBatchId: string | null;
  showKnowledgeBanner?: boolean;
  showTavilyBanner?: boolean;
  showFirstRunChecklist?: boolean;
  knowledgeFilled?: boolean;
  draftCount?: number;
  hasDiscoveryKey?: boolean;
  hasAnyDraftKey?: boolean;
}) {
  const ui = PIPELINE_UI[pipeline];
  const isStudio = pipeline === "studio";
  const runEndpoint = isStudio ? "/api/studio/generate-topics" : "/api/discover";
  const runNoun = isStudio ? "generation" : "discovery";

  const router = useAppRouter();
  const [moreExpanded, setMoreExpanded] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeaderVisible(entry?.isIntersecting ?? true),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const TOP_PICKS_COUNT = 3;

  const { rest, newCount, backlogCount, topSlots } = useMemo(() => {
    const topSlice = initialTrends.slice(0, TOP_PICKS_COUNT);
    const restSlice = initialTrends.slice(TOP_PICKS_COUNT);
    const slots = Array.from({ length: TOP_PICKS_COUNT }, (_, i) => topSlice[i] ?? null);
    let newer = 0;
    let older = 0;
    for (const t of initialTrends) {
      if (latestBatchId && t.discoveryBatchId === latestBatchId) newer += 1;
      else older += 1;
    }
    return {
      rest: restSlice,
      topSlots: slots,
      newCount: newer,
      backlogCount: older,
    };
  }, [initialTrends, latestBatchId]);

  const runHint = lastRun
    ? `Last ${runNoun} ${new Date(lastRun.runAt).toLocaleString()} · ${lastRun.success ? "ok" : "failed"} · added ${lastRun.totalDiscovered} topic${lastRun.totalDiscovered === 1 ? "" : "s"} · ${visiblePoolCount} in pool`
    : visiblePoolCount > 0
      ? `${visiblePoolCount} topic${visiblePoolCount === 1 ? "" : "s"} in your pool (${newCount} new, ${backlogCount} backlog).`
      : isStudio
        ? "Generate ideas to populate your story board."
        : "Run discovery to populate your topic board.";

  const runButtonProps = {
    endpoint: runEndpoint,
    runLabel: ui.runButtonLabel,
    runningLabel: ui.runningLabel,
    onCompleted: refresh,
    successToast: (data: { newStored?: number; carriedOver?: number }) => {
      const n = data.newStored ?? 0;
      const c = data.carriedOver ?? 0;
      return isStudio
        ? `Generated ${n} new idea${n === 1 ? "" : "s"}; ${c} saved from your queue.`
        : `Added ${n} new topic${n === 1 ? "" : "s"}; ${c} carried from your queue.`;
    },
  };

  return (
    <div className="flex flex-col gap-10 pb-20">
      {showFirstRunChecklist ? (
        <FirstRunChecklist
          knowledgeFilled={knowledgeFilled}
          draftCount={draftCount}
          hasDiscoveryKey={hasDiscoveryKey}
          hasAnyDraftKey={hasAnyDraftKey}
          trendCount={initialTrends.length}
        />
      ) : null}

      <section
        id={pipeline}
        ref={headerRef}
        className="flex flex-col gap-4 rounded-xl border border-subtle bg-card px-4 py-5 shadow-ambient sm:px-6 sm:py-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              {ui.headerTitle}
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">{runHint}</p>
            <p className="max-w-xl text-xs text-muted-foreground">
              {ui.poolHint} Each run adds ~{DISCOVERY_NEW_PER_RUN} topics. Pool
              holds {DISCOVERY_VISIBLE_POOL_MIN}–{DISCOVERY_VISIBLE_POOL_MAX}{" "}
              ranked items; unsaved backlog expires after {TOPIC_POOL_TTL_DAYS}{" "}
              days.
            </p>
          </div>
          <DiscoveryRunButton {...runButtonProps} compact />
        </div>
      </section>

      {ui.showBlogBanner ? <BlogPromoBanner /> : null}

      {initialTrends.length === 0 ? (
        <>
          <Card className="border-dashed border-border/80 bg-muted/20 shadow-none">
            <CardHeader>
              <CardTitle>
                {visiblePoolCount > 0
                  ? "Topics in pool — refresh the page"
                  : lastRun && lastRun.totalDiscovered > 0
                    ? "Topics stored but hidden"
                    : "No topics yet"}
              </CardTitle>
              <CardDescription>
                {visiblePoolCount > 0 ? (
                  <>
                    The server sees {visiblePoolCount} active topic
                    {visiblePoolCount === 1 ? "" : "s"}; try a hard refresh.
                  </>
                ) : lastRun && lastRun.totalDiscovered > 0 ? (
                  <>
                    Last run stored {lastRun.totalDiscovered} topic
                    {lastRun.totalDiscovered === 1 ? "" : "s"}, but none match
                    filters (expired, dismissed, or already drafted).
                  </>
                ) : (
                  ui.emptyDescription
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <DiscoveryRunButton {...runButtonProps} />
              {showKnowledgeBanner && isStudio ? (
                <p className="text-sm text-muted-foreground">
                  {ui.knowledgeEmptyCta}{" "}
                  <Link
                    href="/knowledge?studio=1"
                    className="text-brand underline-offset-4 hover:underline"
                  >
                    Open Knowledge builder
                  </Link>
                </p>
              ) : null}
            </CardContent>
          </Card>
          {showKnowledgeBanner && !isStudio ? <KnowledgeEmptyBanner /> : null}
          <section>
            <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Top picks
            </h3>
            <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: TOP_PICKS_COUNT }, (_, i) => (
                <TopicPickPlaceholder key={`empty-${i}`} slot={i + 1} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="flex flex-col gap-10">
          {showKnowledgeBanner && !isStudio ? <KnowledgeEmptyBanner /> : null}
          {showKnowledgeBanner && isStudio ? (
            <Card className="border-dashed border-border/80 bg-muted/20 shadow-none">
              <CardContent className="py-4 text-sm text-muted-foreground">
                {ui.knowledgeEmptyCta}{" "}
                <Link
                  href="/knowledge?studio=1"
                  className="text-brand underline-offset-4 hover:underline"
                >
                  Fill Knowledge
                </Link>
              </CardContent>
            </Card>
          ) : null}

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Top picks
            </h3>
            <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
              {topSlots.map((trend, index) =>
                trend ? (
                  <TopicCard key={trend.id} trend={trend} />
                ) : (
                  <TopicPickPlaceholder key={`empty-${index}`} slot={index + 1} />
                ),
              )}
            </div>
          </section>

          <TopicPoolTable trends={initialTrends} latestBatchId={latestBatchId} />

          {rest.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  More topics ({rest.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMoreExpanded(!moreExpanded)}
                  className="gap-1"
                >
                  {moreExpanded ? (
                    <>
                      <ChevronUp className="size-4" /> Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-4" /> Show all {rest.length}
                    </>
                  )}
                </Button>
              </div>
              {moreExpanded ? (
                <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {rest.map((t) => (
                    <TopicCard key={t.id} trend={t} />
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      )}

      {showTavilyBanner ? <TavilySetupBanner /> : null}

      {ui.customTopicMode === "url" ? (
        <SignalsCustomTopicComposer
          onDraftCreated={(id) => router.push(`/draft/${id}?new=1`)}
        />
      ) : (
        <StudioCustomTopicComposer onAdded={refresh} />
      )}

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-20 border-t border-subtle bg-background/95 px-4 py-2.5 backdrop-blur-sm transition-transform duration-200 lg:hidden",
          headerVisible ? "translate-y-full" : "translate-y-0",
        )}
      >
        <DiscoveryRunButton {...runButtonProps} className="w-full" />
      </div>
    </div>
  );
}

function SignalsCustomTopicComposer({
  onDraftCreated,
}: {
  onDraftCreated: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<"idle" | "scrape" | "gen">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [streamText, setStreamText] = useState("");
  const [streamStatus, setStreamStatus] = useState<string | null>(null);

  async function scrapeUrl(): Promise<void> {
    setBusy("scrape");
    setMsg(null);
    try {
      const result = await fetchJson<{
        titleGuess?: string | null;
        markdownPreview?: string;
      }>("/api/scrape-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!result.ok) throw new Error(result.error);
      if (result.data.titleGuess && !title.trim()) {
        setTitle(result.data.titleGuess);
      }
      if (result.data.markdownPreview) {
        setSummary(result.data.markdownPreview.slice(0, 4000));
      }
      toast("Pulled page content.", "success");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Scrape failed";
      setMsg(message);
      toast(message, "error");
    } finally {
      setBusy("idle");
    }
  }

  async function generate(): Promise<void> {
    if (!title.trim()) {
      setMsg("Title required.");
      return;
    }
    setBusy("gen");
    setMsg(null);
    setStreamText("");
    setStreamStatus(null);
    try {
      const result = await generateDraftStream({
        body: {
          customTopic: {
            title: title.trim(),
            summary: summary.trim() || undefined,
            url: url.trim() ? url.trim() : undefined,
          },
        },
        onDelta: setStreamText,
        onStatus: setStreamStatus,
      });
      onDraftCreated(result.draftId);
      toast("Draft ready — keep editing or copy to LinkedIn.", "success");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Generate failed";
      setMsg(message);
      toast(message, "error");
    } finally {
      setBusy("idle");
      setStreamStatus(null);
    }
  }

  return (
    <>
      <Card className="border-border/80 shadow-pill">
        <CardHeader>
          <CardTitle className="text-lg">Custom topic</CardTitle>
          <CardDescription>
            Paste a URL (
            <Link
              href="/settings"
              className="text-brand underline-offset-4 hover:underline"
            >
              Firecrawl key in Settings
            </Link>{" "}
            required) or write your own angle.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cu-url">Source URL (optional)</Label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="cu-url"
                placeholder="https://…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="max-w-xl flex-1"
              />
              <Button
                type="button"
                variant="outline"
                disabled={busy !== "idle" || !url.trim()}
                onClick={() => void scrapeUrl()}
                className="gap-1"
              >
                {busy === "scrape" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Link2 className="size-4" />
                )}
                Fetch page
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cu-title">Title</Label>
            <Input
              id="cu-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you reacting to?"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cu-sum">Summary / notes</Label>
            <Textarea
              id="cu-sum"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Key facts, your take, bullets…"
              className="min-h-[160px]"
            />
          </div>
          <Button
            type="button"
            disabled={busy !== "idle" || !title.trim()}
            onClick={() => void generate()}
          >
            {busy === "gen" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate draft"
            )}
          </Button>
          {msg ? (
            <p className="text-sm text-muted-foreground" role="status">
              {msg}
            </p>
          ) : null}
        </CardContent>
      </Card>
      {busy === "gen" ? (
        <DraftGenerationOverlay
          title="Generating draft"
          text={streamText}
          statusMessage={streamStatus}
        />
      ) : null}
    </>
  );
}

function StudioCustomTopicComposer({ onAdded }: { onAdded: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function addTopic(): Promise<void> {
    const trimmed = prompt.trim();
    if (trimmed.length < 8) {
      setMsg("Write at least a short sentence about what you want to post.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const result = await fetchJson<{ trendId: string }>(
        "/api/studio/custom-topic",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: trimmed }),
        },
      );
      if (!result.ok) throw new Error(result.error);
      toast("Story idea added to your pool.", "success");
      setPrompt("");
      onAdded();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not add topic";
      setMsg(message);
      toast(message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-border/80 shadow-pill">
      <CardHeader>
        <CardTitle className="text-lg">Write about…</CardTitle>
        <CardDescription>
          Add a personal story idea without running full ideation — then generate
          a draft from the pool.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="studio-prompt">Your angle</Label>
          <Textarea
            id="studio-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Explain why we pivoted from X to Y and what we learned…"
            className="min-h-[120px]"
          />
        </div>
        <Button
          type="button"
          disabled={busy || prompt.trim().length < 8}
          onClick={() => void addTopic()}
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Adding…
            </>
          ) : (
            "Add story idea"
          )}
        </Button>
        {msg ? (
          <p className="text-sm text-muted-foreground" role="status">
            {msg}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
