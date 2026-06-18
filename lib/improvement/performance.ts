import { prisma } from "@/lib/db";
import {
  getMetricValue,
  parsePostMetrics,
} from "@/lib/analytics/social-post-metrics";
import {
  ATTRIBUTION_CONFIDENCE_THRESHOLD,
  MIN_ATTRIBUTED_POSTS_FOR_LEARNING,
  type DimensionBreakdown,
  type PerformanceAnalysis,
  type PerformanceInsightBullet,
  type PerformancePostRow,
} from "@/lib/improvement/types";

function lengthBucket(charCount: number): string {
  if (charCount < 500) return "short";
  if (charCount < 1200) return "medium";
  if (charCount < 2000) return "long";
  return "very_long";
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function buildBreakdown(
  rows: PerformancePostRow[],
  keyFn: (r: PerformancePostRow) => string,
  labelFn?: (k: string) => string,
): DimensionBreakdown[] {
  const groups = new Map<string, PerformancePostRow[]>();
  for (const row of rows) {
    const key = keyFn(row);
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  return Array.from(groups.entries())
    .map(([key, items]) => ({
      key,
      label: labelFn ? labelFn(key) : key,
      count: items.length,
      avgImpressions: avg(
        items.map((i) => i.impressions ?? 0).filter((v) => v > 0),
      ),
      avgEngagementRate: avg(
        items.map((i) => i.engagementRate ?? 0).filter((v) => v > 0),
      ),
    }))
    .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
}

function generateInsightBullets(
  breakdowns: DimensionBreakdown[],
  overallAvgEngagement: number,
  positive: boolean,
): PerformanceInsightBullet[] {
  const bullets: PerformanceInsightBullet[] = [];
  for (const b of breakdowns) {
    if (b.count < 2) continue;
    const ratio =
      overallAvgEngagement > 0
        ? b.avgEngagementRate / overallAvgEngagement
        : 0;
    if (positive && ratio >= 1.2) {
      bullets.push({
        text: `${b.label} posts average ${ratio.toFixed(1)}x your typical engagement rate`,
        metric: "engagementRate",
        value: b.avgEngagementRate,
      });
    } else if (!positive && ratio <= 0.7 && b.avgEngagementRate > 0) {
      bullets.push({
        text: `${b.label} posts underperform at ${(ratio * 100).toFixed(0)}% of your average engagement`,
        metric: "engagementRate",
        value: b.avgEngagementRate,
      });
    }
    if (bullets.length >= 5) break;
  }
  return bullets;
}

export async function analyzePerformance(
  userId: string,
): Promise<PerformanceAnalysis> {
  const posts = await prisma.socialPost.findMany({
    where: { userId, status: "sent" },
    include: {
      channel: { select: { service: true, name: true } },
      draft: {
        select: {
          id: true,
          topicTitle: true,
          pipeline: true,
          trend: {
            select: {
              id: true,
              sourceType: true,
              tags: true,
              pipeline: true,
            },
          },
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });

  const rows: PerformancePostRow[] = posts.map((p) => {
    const metrics = parsePostMetrics(p.metrics);
    const impressions = getMetricValue(metrics, "impressions");
    const reactions = getMetricValue(metrics, "reactions");
    const comments = getMetricValue(metrics, "comments");
    const reposts = getMetricValue(metrics, "reposts");
    const engagementRate = getMetricValue(metrics, "engagementRate");

    return {
      id: p.id,
      textPreview: p.text.slice(0, 120),
      platform: p.channel.service,
      publishedAt: p.publishedAt?.toISOString() ?? null,
      impressions,
      reactions,
      comments,
      reposts,
      engagementRate,
      draftId: p.draftId,
      draftTitle: p.draft?.topicTitle ?? null,
      trendId: p.draft?.trend?.id ?? null,
      pipeline: p.draft?.pipeline ?? p.draft?.trend?.pipeline ?? null,
      sourceType: p.draft?.trend?.sourceType ?? null,
      tags: p.draft?.trend?.tags ?? [],
      attributionConfidence: p.attributionConfidence,
      attributionMethod: p.attributionMethod,
      lengthBucket: lengthBucket(p.text.length),
    };
  });

  const attributed = rows.filter(
    (r) =>
      r.draftId != null &&
      (r.attributionConfidence ?? 0) >= ATTRIBUTION_CONFIDENCE_THRESHOLD,
  );

  const impressions = rows
    .map((r) => r.impressions ?? 0)
    .filter((v) => v > 0);
  const engagementRates = rows
    .map((r) => r.engagementRate ?? 0)
    .filter((v) => v > 0);

  const avgImpressions = avg(impressions);
  const avgEngagementRate = avg(engagementRates);

  const learningRows = attributed.length >= MIN_ATTRIBUTED_POSTS_FOR_LEARNING
    ? attributed
    : rows.filter((r) => r.draftId != null);

  const sortedByEngagement = [...learningRows].sort(
    (a, b) => (b.engagementRate ?? 0) - (a.engagementRate ?? 0),
  );

  const pipelineBreakdown = buildBreakdown(learningRows, (r) =>
    r.pipeline ?? "unknown",
  );
  const sourceBreakdown = buildBreakdown(learningRows, (r) =>
    r.sourceType ?? "unknown",
  );
  const lengthBreakdown = buildBreakdown(learningRows, (r) => r.lengthBucket);

  const tagMap = new Map<string, PerformancePostRow[]>();
  for (const row of learningRows) {
    for (const tag of row.tags) {
      const list = tagMap.get(tag) ?? [];
      list.push(row);
      tagMap.set(tag, list);
    }
  }
  const tagBreakdown: DimensionBreakdown[] = Array.from(tagMap.entries())
    .map(([key, items]) => ({
      key,
      label: key,
      count: items.length,
      avgImpressions: avg(
        items.map((i) => i.impressions ?? 0).filter((v) => v > 0),
      ),
      avgEngagementRate: avg(
        items.map((i) => i.engagementRate ?? 0).filter((v) => v > 0),
      ),
    }))
    .filter((b) => b.count >= 2)
    .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
    .slice(0, 8);

  const whatsWorking = [
    ...generateInsightBullets(pipelineBreakdown, avgEngagementRate, true),
    ...generateInsightBullets(sourceBreakdown, avgEngagementRate, true),
    ...generateInsightBullets(tagBreakdown, avgEngagementRate, true),
    ...generateInsightBullets(lengthBreakdown, avgEngagementRate, true),
  ].slice(0, 5);

  const whatsNotWorking = [
    ...generateInsightBullets(pipelineBreakdown, avgEngagementRate, false),
    ...generateInsightBullets(sourceBreakdown, avgEngagementRate, false),
    ...generateInsightBullets(tagBreakdown, avgEngagementRate, false),
    ...generateInsightBullets(lengthBreakdown, avgEngagementRate, false),
  ].slice(0, 5);

  if (whatsWorking.length === 0 && learningRows.length > 0) {
    const top = sortedByEngagement[0];
    if (top) {
      whatsWorking.push({
        text: `Best performer: "${top.textPreview.slice(0, 60)}…" with ${top.engagementRate?.toFixed(1) ?? "—"}% engagement`,
      });
    }
  }

  return {
    sufficientData: attributed.length >= MIN_ATTRIBUTED_POSTS_FOR_LEARNING,
    minPostsRequired: MIN_ATTRIBUTED_POSTS_FOR_LEARNING,
    stats: {
      postsAnalyzed: rows.length,
      postsAttributed: attributed.length,
      postsSkipped: rows.length - rows.filter((r) => r.draftId).length,
      avgImpressions,
      avgEngagementRate,
    },
    whatsWorking,
    whatsNotWorking,
    topPerformers: sortedByEngagement.slice(0, 5),
    bottomPerformers: sortedByEngagement.slice(-5).reverse(),
    breakdowns: {
      pipeline: pipelineBreakdown,
      sourceType: sourceBreakdown,
      tags: tagBreakdown,
      lengthBucket: lengthBreakdown,
    },
  };
}
