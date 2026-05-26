import type { Prisma } from "@prisma/client";
import { isTrendActiveForDashboard } from "@/lib/discovery/carry-over";
import { prisma } from "@/lib/db";
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

/** Prisma where for non-dismissed trends (includes NULL feedbackStatus — required for Postgres). */
function activeTrendWhere(
  userId: string,
  now: Date,
  excludeHashes: string[],
): Prisma.TrendWhereInput {
  return {
    userId,
    OR: [{ feedbackStatus: null }, { feedbackStatus: "saved" }],
    AND: [
      {
        OR: [
          { expiresAt: { gt: now } },
          {
            AND: [
              { feedbackStatus: "saved" },
              { savedUntil: { gt: now } },
            ],
          },
        ],
      },
      ...(excludeHashes.length > 0
        ? [{ urlHash: { notIn: excludeHashes } }]
        : []),
    ],
  };
}

export async function countVisibleTrendsForDashboard(
  userId: string,
): Promise<number> {
  const now = new Date();
  const excludeHashes = await getExcludedUrlHashesForDashboard(userId);
  return prisma.trend.count({
    where: activeTrendWhere(userId, now, Array.from(excludeHashes)),
  });
}

export async function fetchTrendsForDashboard(
  userId: string,
  limit: number,
): Promise<DashboardTrendRow[]> {
  const now = new Date();
  const excludeHashes = await getExcludedUrlHashesForDashboard(userId);
  const excludeArr = Array.from(excludeHashes);

  const rows = await prisma.trend.findMany({
    where: activeTrendWhere(userId, now, excludeArr),
    orderBy: [{ finalScore: "desc" }, { discoveredAt: "desc" }],
    take: limit,
    select: trendDashboardSelect,
  });

  return rows.filter((t) => isTrendActiveForDashboard(t, now));
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
