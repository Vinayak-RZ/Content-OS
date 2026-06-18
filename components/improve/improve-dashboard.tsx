"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { DiscoveryRunButton } from "@/components/discovery-run-button";
import { LinkedInTrendsPanel } from "@/components/improve/linkedin-trends-panel";
import { InsightFilesViewer } from "@/components/improve/insight-files-viewer";
import { PerformanceAnalysisPanel } from "@/components/improve/performance-analysis";
import { ProposalReview } from "@/components/improve/proposal-review";
import { RunHistory } from "@/components/improve/run-history";
import type {
  ImprovementRunSummary,
  LinkedInResearchResult,
  PerformanceAnalysis,
} from "@/lib/improvement/types";

const STEPS = [
  "sync",
  "attribute",
  "analyze",
  "research",
  "insights",
  "proposals",
] as const;

const STEP_LABELS: Record<string, string> = {
  sync: "Sync metrics",
  attribute: "Match posts",
  analyze: "Analyze performance",
  research: "Research LinkedIn",
  insights: "Write insight files",
  proposals: "Generate proposals",
};

type LatestRun = {
  id: string;
  status: string;
  step: string | null;
  startedAt: string;
  completedAt: string | null;
  summary: ImprovementRunSummary | null;
  error: string | null;
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-subtle bg-card p-6 shadow-ambient sm:p-8">
      <div className="mb-6">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function ImproveDashboard() {
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [research, setResearch] = useState<LinkedInResearchResult | null>(
    null,
  );
  const [latestRun, setLatestRun] = useState<LatestRun | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(async () => {
    const [perfRes, runsRes] = await Promise.all([
      fetch("/api/improve/performance"),
      fetch("/api/improve/runs"),
    ]);
    const perfData = (await perfRes.json()) as PerformanceAnalysis;
    const runsData = (await runsRes.json()) as { runs?: LatestRun[] };
    setAnalysis(perfData);
    const latest = runsData.runs?.[0] ?? null;
    setLatestRun(latest);
    if (latest?.summary?.linkedinResearch) {
      setResearch(latest.summary.linkedinResearch);
    }
    if (latest?.summary?.analysis) {
      setAnalysis(latest.summary.analysis);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, refreshKey]);

  useEffect(() => {
    if (latestRun?.status !== "running") return;
    const interval = setInterval(() => void refresh(), 3000);
    return () => clearInterval(interval);
  }, [latestRun?.status, refresh]);

  const onRunComplete = useCallback(async () => {
    setRefreshKey((k) => k + 1);
  }, []);

  const currentStepIndex = latestRun?.step
    ? STEPS.indexOf(latestRun.step as (typeof STEPS)[number])
    : -1;

  return (
    <div className="space-y-8">
      <Section
        title="Run improvement"
        description="Sync post metrics, analyze what works, research LinkedIn trends, update agent insight files, and generate proposals."
      >
        <div className="flex flex-wrap items-center gap-4">
          <DiscoveryRunButton
            endpoint="/api/improve/run"
            runLabel="Run improvement"
            runningLabel="Running improvement…"
            successToast={() => "Improvement cycle completed."}
            onCompleted={onRunComplete}
          />
          {latestRun ? (
            <div className="text-sm text-muted-foreground">
              Last run:{" "}
              <span className="font-medium capitalize">{latestRun.status}</span>
              {latestRun.completedAt
                ? ` · ${new Date(latestRun.completedAt).toLocaleString()}`
                : latestRun.status === "running"
                  ? " · in progress"
                  : ""}
            </div>
          ) : null}
        </div>

        {latestRun?.status === "running" ? (
          <div className="mt-6">
            <div className="mb-2 flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              {latestRun.step
                ? STEP_LABELS[latestRun.step] ?? latestRun.step
                : "Starting…"}
            </div>
            <div className="flex gap-1">
              {STEPS.map((step, i) => (
                <div
                  key={step}
                  className={`h-1.5 flex-1 rounded-full ${
                    i <= currentStepIndex ? "bg-brand" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : null}

        {latestRun?.error ? (
          <p className="mt-4 text-sm text-red-600">{latestRun.error}</p>
        ) : null}

        {latestRun?.summary?.stats ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/20 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Posts analyzed</span>
              <p className="font-heading text-xl font-semibold tabular-nums">
                {latestRun.summary.stats.postsAnalyzed}
              </p>
            </div>
            <div className="rounded-lg bg-muted/20 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Files updated</span>
              <p className="font-heading text-xl font-semibold tabular-nums">
                {latestRun.summary.insightFilesUpdated?.length ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-muted/20 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Proposals</span>
              <p className="font-heading text-xl font-semibold tabular-nums">
                {latestRun.summary.proposalsCreated?.length ?? 0}
              </p>
            </div>
          </div>
        ) : null}
      </Section>

      <Section
        title="Your performance analysis"
        description="All synced Buffer posts — classified by content domain (startup insights, entrepreneurship, etc.), not just Content OS drafts."
      >
        {analysis ? (
          <PerformanceAnalysisPanel analysis={analysis} />
        ) : (
          <p className="text-sm text-muted-foreground">Loading analysis…</p>
        )}
      </Section>

      <Section
        title="LinkedIn trend research"
        description="What the agent found online about content working on LinkedIn right now."
      >
        <LinkedInTrendsPanel research={research} />
      </Section>

      <Section
        title="Agent insight files"
        description="Auto-maintained documents the agent writes based on your performance data."
      >
        <InsightFilesViewer key={refreshKey} />
      </Section>

      <Section
        title="Pending proposals"
        description="Review and approve changes to your writing style or ranking weights."
      >
        <ProposalReview onChanged={onRunComplete} />
      </Section>

      <Section title="Run history" description="Past improvement cycles.">
        <RunHistory key={refreshKey} />
      </Section>
    </div>
  );
}
