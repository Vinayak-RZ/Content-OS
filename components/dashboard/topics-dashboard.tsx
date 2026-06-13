"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Link2, Loader2 } from "lucide-react";
import { generateDraftStream } from "@/lib/client/generate-draft-stream";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";
import { useAppRouter } from "@/lib/client/use-app-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DiscoveryRunButton } from "@/components/discovery-run-button";
import { BlogWritingSection } from "@/components/blog/blog-writing-section";
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
import type { SerializedBlogSummary } from "@/lib/blogs/types";
import type { SerializedDashboardTrend } from "@/lib/trends/types";

export function TopicsDashboard({
  initialTrends,
  lastDiscovery,
  visiblePoolCount,
  latestBatchId,
  showKnowledgeBanner = false,
  showTavilyBanner = false,
  showFirstRunChecklist = false,
  knowledgeFilled = true,
  draftCount = 0,
  hasDiscoveryKey = false,
  hasAnyDraftKey = false,
  recentBlogs = [],
  hasTavilyKey = false,
  hasFirecrawlKey = false,
}: {
  initialTrends: SerializedDashboardTrend[];
  lastDiscovery: {
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
  recentBlogs?: SerializedBlogSummary[];
  hasTavilyKey?: boolean;
  hasFirecrawlKey?: boolean;
}) {
  const router = useAppRouter();
  const [moreExpanded, setMoreExpanded] = useState(false);
  const signalsRef = useRef<HTMLElement>(null);
  const [signalsVisible, setSignalsVisible] = useState(true);

  useEffect(() => {
    const el = signalsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSignalsVisible(entry?.isIntersecting ?? true),
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
      top: topSlice,
      rest: restSlice,
      topSlots: slots,
      newCount: newer,
      backlogCount: older,
    };
  }, [initialTrends, latestBatchId]);

  const discoveryHint = lastDiscovery
    ? `Last discovery ${new Date(lastDiscovery.runAt).toLocaleString()} · ${lastDiscovery.success ? "ok" : "failed"} · added ${lastDiscovery.totalDiscovered} topic${lastDiscovery.totalDiscovered === 1 ? "" : "s"} · ${visiblePoolCount} in pool`
    : visiblePoolCount > 0
      ? `${visiblePoolCount} topic${visiblePoolCount === 1 ? "" : "s"} in your pool (${newCount} new, ${backlogCount} backlog).`
      : "Run discovery to populate your topic board.";

  return (
    <div className="grid gap-10 pb-20 xl:grid-cols-[minmax(0,1fr)_min(24rem,34%)] xl:items-start">
      <div className="flex min-w-0 flex-col gap-10">
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
        id="signals"
        ref={signalsRef}
        className="flex flex-col gap-4 rounded-xl border border-subtle bg-card px-4 py-5 shadow-ambient sm:px-6 sm:py-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Today&apos;s signals
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">{discoveryHint}</p>
            <p className="max-w-xl text-xs text-muted-foreground">
              Each run researches ~{DISCOVERY_NEW_PER_RUN} new topics. Your pool
              holds {DISCOVERY_VISIBLE_POOL_MIN}–{DISCOVERY_VISIBLE_POOL_MAX}{" "}
              ranked items; unsaved backlog expires after {TOPIC_POOL_TTL_DAYS}{" "}
              days. Save topics in the pool table to keep them longer.
            </p>
          </div>
          <DiscoveryRunButton onCompleted={refresh} compact />
        </div>
      </section>

      {initialTrends.length === 0 ? (
        <>
          <Card className="border-dashed border-border/80 bg-muted/20 shadow-none">
            <CardHeader>
              <CardTitle>
                {visiblePoolCount > 0
                  ? "Topics in pool - refresh the page"
                  : lastDiscovery && lastDiscovery.totalDiscovered > 0
                    ? "Topics stored but hidden"
                    : "No topics yet"}
              </CardTitle>
              <CardDescription>
                {visiblePoolCount > 0 ? (
                  <>
                    The server sees {visiblePoolCount} active topic
                    {visiblePoolCount === 1 ? "" : "s"}; try a hard refresh.
                  </>
                ) : lastDiscovery && lastDiscovery.totalDiscovered > 0 ? (
                  <>
                    Discovery stored {lastDiscovery.totalDiscovered} topic
                    {lastDiscovery.totalDiscovered === 1 ? "" : "s"}, but none
                    match dashboard filters (expired, dismissed, or already drafted).
                    Run discovery again or check Analytics.
                  </>
                ) : (
                  <>
                    Run discovery or paste a custom URL below. Seed Knowledge files
                    first so ranking + drafts sound like you.
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DiscoveryRunButton onCompleted={refresh} />
            </CardContent>
          </Card>
          {showKnowledgeBanner ? <KnowledgeEmptyBanner /> : null}
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
          {showKnowledgeBanner ? <KnowledgeEmptyBanner /> : null}

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
                  More topics ({rest.length}) - all can be drafted
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

      <CustomTopicComposer
        onDraftCreated={(id) => router.push(`/draft/${id}?new=1`)}
      />

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-20 border-t border-subtle bg-background/95 px-4 py-2.5 backdrop-blur-sm transition-transform duration-200 lg:hidden",
          signalsVisible ? "translate-y-full" : "translate-y-0",
        )}
      >
        <DiscoveryRunButton onCompleted={refresh} className="w-full" />
      </div>
      </div>

      <aside className="min-w-0 xl:sticky xl:top-4">
        <BlogWritingSection
          initialBlogs={recentBlogs}
          hasTavilyKey={hasTavilyKey}
          hasFirecrawlKey={hasFirecrawlKey}
          hasAnyDraftKey={hasAnyDraftKey}
        />
      </aside>
    </div>
  );
}

function CustomTopicComposer({
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
      toast("Draft ready - keep editing or copy to LinkedIn.", "success");
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
          </Link>
          {" "}
          required) or write your own angle - generates a draft with your Knowledge
          context.
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
        <div className="flex flex-wrap gap-3">
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
        </div>
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
