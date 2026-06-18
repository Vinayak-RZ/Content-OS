import type { PostMetric } from "@/lib/buffer/types";
import {
  formatMetricValue,
  PRIMARY_METRIC_TYPES,
} from "@/lib/analytics/social-post-metrics";

type SocialPostMetricsProps = {
  metrics: PostMetric[];
  metricsUpdatedAt?: string | null;
  compact?: boolean;
};

export function SocialPostMetrics({
  metrics,
  metricsUpdatedAt,
  compact = false,
}: SocialPostMetricsProps) {
  const byType = new Map(metrics.map((m) => [m.type, m]));
  const primarySet = new Set<string>(PRIMARY_METRIC_TYPES);
  const ordered = [
    ...PRIMARY_METRIC_TYPES.map((type) => byType.get(type)).filter(Boolean),
    ...metrics.filter((m) => !primarySet.has(m.type)),
  ] as PostMetric[];

  if (ordered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No metrics yet. Buffer refreshes performance data about once per day.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={
          compact
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        }
      >
        {ordered.map((metric) => (
          <article
            key={metric.type}
            className="rounded-xl border border-subtle bg-muted/20 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {metric.name}
            </p>
            <p className="mt-2 font-heading text-2xl font-semibold tabular-nums">
              {formatMetricValue(metric)}
            </p>
          </article>
        ))}
      </div>
      {metricsUpdatedAt ? (
        <p className="text-xs text-muted-foreground">
          Metrics last updated by Buffer{" "}
          {new Date(metricsUpdatedAt).toLocaleString()}. Engagement can lag up to
          ~24 hours.
        </p>
      ) : null}
    </div>
  );
}
