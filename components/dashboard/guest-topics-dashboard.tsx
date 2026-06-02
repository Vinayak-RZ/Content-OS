"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { GuestSignInBanner } from "@/components/guest/guest-sign-in-banner";
import { DiscoveryRunButton } from "@/components/discovery-run-button";
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
import { GUEST_TOPICS_STORAGE_KEY } from "@/lib/guest/constants";
import { DISCOVERY_NEW_PER_RUN } from "@/lib/discovery/founder-profile";
import type { SerializedDashboardTrend } from "@/lib/trends/types";
import { cn } from "@/lib/utils";

function loadStoredTrends(): SerializedDashboardTrend[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(GUEST_TOPICS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SerializedDashboardTrend[]) : [];
  } catch {
    return [];
  }
}

function persistTrends(trends: SerializedDashboardTrend[]): void {
  try {
    sessionStorage.setItem(GUEST_TOPICS_STORAGE_KEY, JSON.stringify(trends));
  } catch {
    /* quota or private mode */
  }
}

export function GuestTopicsDashboard() {
  const [trends, setTrends] = useState<SerializedDashboardTrend[]>([]);
  const [latestBatchId, setLatestBatchId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [moreExpanded, setMoreExpanded] = useState(false);
  const signalsRef = useRef<HTMLElement>(null);
  const [signalsVisible, setSignalsVisible] = useState(true);

  useEffect(() => {
    setTrends(loadStoredTrends());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistTrends(trends);
  }, [trends, hydrated]);

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

  const onGuestDiscovery = useCallback(
    (payload: {
      topics?: SerializedDashboardTrend[];
      batchId?: string;
      newStored?: number;
    }) => {
      const incoming = payload.topics ?? [];
      if (incoming.length === 0) return;
      const batchId = payload.batchId ?? incoming[0]?.discoveryBatchId ?? null;
      setLatestBatchId(batchId);
      setTrends((prev) => {
        const seen = new Set(prev.map((t) => t.url));
        const merged = [
          ...incoming.filter((t) => !seen.has(t.url)),
          ...prev,
        ];
        return merged.slice(0, 20);
      });
    },
    [],
  );

  const TOP_PICKS_COUNT = 3;
  const { rest, newCount, backlogCount, topSlots } = useMemo(() => {
    const topSlice = trends.slice(0, TOP_PICKS_COUNT);
    const restSlice = trends.slice(TOP_PICKS_COUNT);
    const slots = Array.from({ length: TOP_PICKS_COUNT }, (_, i) => topSlice[i] ?? null);
    let newer = 0;
    let older = 0;
    for (const t of trends) {
      if (latestBatchId && t.discoveryBatchId === latestBatchId) newer += 1;
      else older += 1;
    }
    return {
      rest: restSlice,
      topSlots: slots,
      newCount: newer,
      backlogCount: older,
    };
  }, [trends, latestBatchId]);

  const discoveryHint =
    trends.length > 0
      ? `${trends.length} topic${trends.length === 1 ? "" : "s"} in this browser session (${newCount} from latest run, ${backlogCount} earlier). Sign in to save permanently.`
      : "Run discovery to preview ranked topics. Nothing is saved until you sign in.";

  return (
    <div className="flex flex-col gap-10 pb-20">
      <GuestSignInBanner />

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
              Each guest run researches ~{DISCOVERY_NEW_PER_RUN} new topics using
              public sources. Results stay in this tab until you sign in.
            </p>
          </div>
          <DiscoveryRunButton guest onGuestCompleted={onGuestDiscovery} compact />
        </div>
      </section>

      {!hydrated || trends.length === 0 ? (
        <>
          <Card className="border-dashed border-border/80 bg-muted/20 shadow-none">
            <CardHeader>
              <CardTitle>No topics yet</CardTitle>
              <CardDescription>
                Run discovery to see how Content OS ranks signals, or sign in to
                connect your knowledge base and API keys.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DiscoveryRunButton guest onGuestCompleted={onGuestDiscovery} />
            </CardContent>
          </Card>
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
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Top picks
            </h3>
            <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
              {topSlots.map((trend, index) =>
                trend ? (
                  <TopicCard key={trend.id} trend={trend} guestMode />
                ) : (
                  <TopicPickPlaceholder key={`empty-${index}`} slot={index + 1} />
                ),
              )}
            </div>
          </section>

          <TopicPoolTable
            trends={trends}
            latestBatchId={latestBatchId}
            guestMode
          />

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
                    <TopicCard key={t.id} trend={t} guestMode />
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      )}

      <Card className="border-border/80 shadow-pill">
        <CardHeader>
          <CardTitle className="text-lg">Want drafts and saved topics?</CardTitle>
          <CardDescription>
            Sign in to encrypt your API keys, upload Knowledge files, and keep
            discovery results across sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button>Sign in with Google</Button>
          </Link>
        </CardContent>
      </Card>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-20 border-t border-subtle bg-background/95 px-4 py-2.5 backdrop-blur-sm transition-transform duration-200 lg:hidden",
          signalsVisible ? "translate-y-full" : "translate-y-0",
        )}
      >
        <DiscoveryRunButton
          guest
          onGuestCompleted={onGuestDiscovery}
          className="w-full"
        />
      </div>
    </div>
  );
}
