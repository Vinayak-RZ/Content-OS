import type { PostMetric } from "@/lib/buffer/types";

export function parsePostMetrics(metrics: unknown): PostMetric[] {
  if (!Array.isArray(metrics)) return [];
  return metrics.filter(
    (m): m is PostMetric =>
      m != null &&
      typeof m === "object" &&
      typeof (m as PostMetric).type === "string" &&
      typeof (m as PostMetric).value === "number",
  );
}

export function getMetricValue(
  metrics: unknown,
  type: string,
): number | null {
  const parsed = parsePostMetrics(metrics);
  const match = parsed.find((m) => m.type === type);
  return match?.value ?? null;
}

export function formatMetricValue(metric: PostMetric): string {
  if (metric.unit === "percentage") {
    return `${metric.value.toFixed(1)}%`;
  }
  if (Number.isInteger(metric.value)) {
    return metric.value.toLocaleString();
  }
  return metric.value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export const PRIMARY_METRIC_TYPES = [
  "impressions",
  "reach",
  "reactions",
  "comments",
  "reposts",
  "engagementRate",
] as const;
