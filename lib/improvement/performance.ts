import { prisma } from "@/lib/db";
import {
  getMetricValue,
  parsePostMetrics,
} from "@/lib/analytics/social-post-metrics";
import { classifyPostDomain } from "@/lib/improvement/domains";
import { isPostAttributed } from "@/lib/improvement/attribution";
import {
  MIN_POSTS_FOR_LEARNING,
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

function generateDomainInsightBullets(
  breakdowns: DimensionBreakdown[],
  overallAvgEngagement: number,
  positive: boolean,
): PerformanceInsightBullet[] {
  const bullets: PerformanceInsightBullet[] = [];
  for (const b of breakdowns) {
    if (b.key === "general") continue;
    if (b.count < 2) continue;
    const ratio =
      overallAvgEngagement > 0
        ? b.avgEngagementRate / overallAvgEngagement
        : 0;
    if (positive && ratio >= 1.15) {
      bullets.push({
        text: `${b.label} content averages ${ratio.toFixed(1)}x your typical engagement rate`,
        metric: "engagementRate",
        value: b.avgEngagementRate,
      });
    } else if (!positive && ratio <= 0.75 && b.avgEngagementRate > 0) {
      bullets.push({
        text: `${b.label} content underperforms at ${(ratio * 100).toFixed(0)}% of your average engagement`,
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
    take: 200,
  });

  const rows: PerformancePostRow[] = posts.map((p) => {
    const metrics = parsePostMetrics(p.metrics);
    const impressions = getMetricValue(metrics, "impressions");
    const reactions = getMetricValue(metrics, "reactions");
    const comments = getMetricValue(metrics, "comments");
    const reposts = getMetricValue(metrics, "reposts");
    const engagementRate = getMetricValue(metrics, "engagementRate");
    const domain = classifyPostDomain(p.text);

    const publishedAt = p.publishedAt?.toISOString() ?? null;

    return {
      id: p.id,
      textPreview: p.text.slice(0, 120),
      platform: p.channel.service,
      publishedAt,
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
      contentDomain: domain.key,
      contentDomainLabel: domain.label,
      attributionConfidence: p.attributionConfidence,
      attributionMethod: p.attributionMethod,
      isAttributed: isPostAttributed({
        draftId: p.draftId,
        attributionConfidence: p.attributionConfidence,
        publishedAt,
      }),
      lengthBucket: lengthBucket(p.text.length),
    };
  });

  const postsWithMetrics = rows.filter((r) => r.engagementRate != null);
  const postsAttributed = rows.filter((r) => r.isAttributed).length;
  const postsUnattributed = rows.length - postsAttributed;
  const postsFromContentOs = rows.filter((r) => r.draftId != null).length;

  const impressions = rows
    .map((r) => r.impressions ?? 0)
    .filter((v) => v > 0);
  const engagementRates = postsWithMetrics.map((r) => r.engagementRate ?? 0);

  const avgImpressions = avg(impressions);
  const avgEngagementRate = avg(engagementRates);

  const sortedByEngagement = [...rows].sort(
    (a, b) => (b.engagementRate ?? 0) - (a.engagementRate ?? 0),
  );

  const domainBreakdown = buildBreakdown(rows, (r) => r.contentDomain, (k) => {
    const row = rows.find((r) => r.contentDomain === k);
    return row?.contentDomainLabel ?? k;
  });
  const platformBreakdown = buildBreakdown(rows, (r) => r.platform);
  const lengthBreakdown = buildBreakdown(rows, (r) => r.lengthBucket);

  const whatsWorking = generateDomainInsightBullets(
    domainBreakdown,
    avgEngagementRate,
    true,
  ).slice(0, 5);

  const whatsNotWorking = generateDomainInsightBullets(
    domainBreakdown,
    avgEngagementRate,
    false,
  ).slice(0, 5);

  if (whatsWorking.length === 0 && rows.length > 0) {
    const top = sortedByEngagement.find((p) => p.engagementRate != null);
    if (top) {
      whatsWorking.push({
        text: `${top.contentDomainLabel} content performs best (${top.engagementRate?.toFixed(1) ?? "—"}% avg engagement on top posts)`,
      });
    }
  }

  return {
    sufficientData: postsWithMetrics.length >= MIN_POSTS_FOR_LEARNING,
    minPostsRequired: MIN_POSTS_FOR_LEARNING,
    stats: {
      postsAnalyzed: rows.length,
      postsAttributed,
      postsUnattributed,
      postsFromContentOs,
      avgImpressions,
      avgEngagementRate,
    },
    whatsWorking,
    whatsNotWorking,
    topPerformers: sortedByEngagement.slice(0, 5),
    bottomPerformers: sortedByEngagement
      .filter((p) => p.engagementRate != null)
      .slice(-5)
      .reverse(),
    breakdowns: {
      domains: domainBreakdown.filter((d) => d.key !== "general"),
      platform: platformBreakdown,
      lengthBucket: lengthBreakdown,
    },
  };
}
