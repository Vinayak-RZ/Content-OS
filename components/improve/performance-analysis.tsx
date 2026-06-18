"use client";

import type { DimensionBreakdown, PerformanceAnalysis } from "@/lib/improvement/types";
import Link from "next/link";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <article className="rounded-xl border border-subtle bg-card p-4 shadow-ambient">
      <p className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-heading text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </article>
  );
}

function BreakdownBars({
  title,
  data,
}: {
  title: string;
  data: DimensionBreakdown[];
}) {
  if (data.length === 0) return null;
  const max = Math.max(0.01, ...data.map((d) => d.avgEngagementRate));

  return (
    <div className="rounded-lg border border-subtle bg-muted/10 p-4">
      <h4 className="font-heading text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2">
        {data.slice(0, 6).map((row) => (
          <li key={row.key}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium capitalize">{row.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {row.avgEngagementRate.toFixed(1)}% · {row.count} posts
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${(row.avgEngagementRate / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InsightList({
  title,
  items,
  variant,
}: {
  title: string;
  items: { text: string }[];
  variant: "positive" | "negative";
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg border border-subtle p-4">
      <h4 className="font-heading text-sm font-semibold">{title}</h4>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((item, i) => (
          <li
            key={i}
            className={
              variant === "positive"
                ? "text-foreground"
                : "text-muted-foreground"
            }
          >
            • {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostTable({
  title,
  posts,
}: {
  title: string;
  posts: PerformanceAnalysis["topPerformers"];
}) {
  if (posts.length === 0) return null;

  return (
    <div>
      <h4 className="mb-3 font-heading text-sm font-semibold">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-subtle">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-subtle bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-semibold">Post</th>
              <th className="px-3 py-2 font-semibold">Domain</th>
              <th className="px-3 py-2 font-semibold">Impr.</th>
              <th className="px-3 py-2 font-semibold">Interactions</th>
              <th className="px-3 py-2 font-semibold">Platform</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-muted/10">
                <td className="max-w-xs px-4 py-3">
                  <p className="line-clamp-2 font-medium">{post.textPreview}</p>
                </td>
                <td className="px-3 py-3 text-sm">{post.contentDomainLabel}</td>
                <td className="px-3 py-3 tabular-nums">
                  {post.impressions?.toLocaleString() ?? "—"}
                </td>
                <td className="px-3 py-3 tabular-nums">
                  {(
                    (post.reactions ?? 0) +
                    (post.comments ?? 0) +
                    (post.reposts ?? 0)
                  ).toLocaleString()}
                </td>
                <td className="px-3 py-3 capitalize">{post.platform}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PerformanceAnalysisPanel({
  analysis,
}: {
  analysis: PerformanceAnalysis;
}) {
  const stats = analysis.stats;
  if (!stats || stats.postsAnalyzed === 0) {
    return (
      <div className="rounded-xl border border-subtle bg-card p-8 text-center shadow-ambient">
        <p className="text-sm text-muted-foreground">
          No synced posts yet. Publish via Buffer and run a sync from{" "}
          <Link href="/analytics" className="font-semibold text-brand hover:underline">
            Analytics
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Posts analyzed"
          value={stats.postsAnalyzed}
          hint={`${stats.postsAttributed ?? 0} attributed · ${stats.postsUnattributed ?? 0} not attributed`}
        />
        <StatCard
          label="Avg impressions"
          value={Math.round(stats.avgImpressions ?? 0).toLocaleString()}
        />
        <StatCard
          label="Avg engagement"
          value={`${(stats.avgEngagementRate ?? 0).toFixed(1)}%`}
        />
        <StatCard
          label="Learning ready"
          value={analysis.sufficientData ? "Yes" : "Need more"}
          hint={
            analysis.sufficientData
              ? "Enough posts with engagement data"
              : `Need ${analysis.minPostsRequired} posts with metrics`
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InsightList
          title="What's working"
          items={analysis.whatsWorking}
          variant="positive"
        />
        <InsightList
          title="What's not working"
          items={analysis.whatsNotWorking}
          variant="negative"
        />
      </div>

      <PostTable title="Top performers" posts={analysis.topPerformers} />
      <PostTable title="Bottom performers" posts={analysis.bottomPerformers} />

      <div className="grid gap-4 md:grid-cols-2">
        <BreakdownBars title="By content domain" data={analysis.breakdowns?.domains ?? []} />
        <BreakdownBars title="By platform" data={analysis.breakdowns?.platform ?? []} />
        <BreakdownBars title="By post length" data={analysis.breakdowns?.lengthBucket ?? []} />
      </div>
    </div>
  );
}
