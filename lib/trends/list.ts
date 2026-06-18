import type { Prisma } from "@prisma/client";
import { isTrendActiveForDashboard } from "@/lib/discovery/carry-over";
import { prisma } from "@/lib/db";
import type { ContentPipeline } from "@/lib/pipelines/types";
import { getExcludedUrlHashesForDashboard } from "@/lib/topic-memory";

export const trendDashboardSelect = {
  id: true,
  title: true,
  source: true,
  url: true,
  summary: true,
  trendScore: true,
  finalScore: true,
  tags: true,
  sourceType: true,
  discoveredAt: true,
  expiresAt: true,
  feedbackStatus: true,
  feedbackAt: true,
  savedUntil: true,
  discoveryBatchId: true,
} satisfies Prisma.TrendSelect;

export type DashboardTrendRow = Prisma.TrendGetPayload<{
  select: typeof trendDashboardSelect;
}>;

/** Prisma where for non-dismissed trends (includes NULL feedbackStatus - required for Postgres). */
function activeTrendWhere(
  userId: string,
  pipeline: ContentPipeline,
  now: Date,
  excludeHashes: string[],
): Prisma.TrendWhereInput {
  return {
    userId,
    pipeline,
    OR: [{ feedbackStatus: null }, { feedbackStatus: "saved" }],
    AND: [
      {
        OR: [{ expiresAt: { gt: now } }, { feedbackStatus: "saved" }],
      },
      ...(excludeHashes.length > 0
        ? [{ urlHash: { notIn: excludeHashes } }]
        : []),
    ],
  };
}

async function dashboardTrendContext(
  userId: string,
  pipeline: ContentPipeline,
) {
  const now = new Date();
  const excludeHashes = await getExcludedUrlHashesForDashboard(userId);
  const excludeArr = Array.from(excludeHashes);
  return {
    now,
    where: activeTrendWhere(userId, pipeline, now, excludeArr),
  };
}

export async function countVisibleTrendsForDashboard(
  userId: string,
  pipeline: ContentPipeline = "signals",
): Promise<number> {
  const { where } = await dashboardTrendContext(userId, pipeline);
  return prisma.trend.count({ where });
}

export async function fetchTrendsForDashboard(
  userId: string,
  limit: number,
  pipeline: ContentPipeline = "signals",
): Promise<DashboardTrendRow[]> {
  const { trends } = await fetchDashboardTrendsBundle(userId, limit, pipeline);
  return trends;
}

/** One exclude-hash fetch per request for count + list. */
export async function fetchDashboardTrendsBundle(
  userId: string,
  limit: number,
  pipeline: ContentPipeline = "signals",
): Promise<{ visiblePoolCount: number; trends: DashboardTrendRow[] }> {
  const { now, where } = await dashboardTrendContext(userId, pipeline);

  const [visiblePoolCount, rows] = await Promise.all([
    prisma.trend.count({ where }),
    prisma.trend.findMany({
      where,
      orderBy: [{ finalScore: "desc" }, { discoveredAt: "desc" }],
      take: limit,
      select: trendDashboardSelect,
    }),
  ]);

  return {
    visiblePoolCount,
    trends: rows.filter((t) => isTrendActiveForDashboard(t, now)),
  };
}

export type SerializedDashboardTrend = Omit<
  DashboardTrendRow,
  "discoveredAt" | "expiresAt" | "feedbackAt" | "savedUntil"
> & {
  discoveredAt: string;
  expiresAt: string;
  feedbackAt: string | null;
  savedUntil: string | null;
};

export function serializeDashboardTrend(
  row: DashboardTrendRow,
): SerializedDashboardTrend {
  return {
    ...row,
    discoveredAt: row.discoveredAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    feedbackAt: row.feedbackAt?.toISOString() ?? null,
    savedUntil: row.savedUntil?.toISOString() ?? null,
  };
}
