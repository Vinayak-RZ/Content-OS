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

export async function fetchTrendsForDashboard(
  userId: string,
  limit: number,
): Promise<DashboardTrendRow[]> {
  const now = new Date();
  const excludeHashes = await getExcludedUrlHashesForDashboard(userId);
  const excludeArr = Array.from(excludeHashes);

  const rows = await prisma.trend.findMany({
    where: {
      userId,
      feedbackStatus: { not: "dismissed" },
      OR: [
        { expiresAt: { gt: now } },
        {
          AND: [
            { feedbackStatus: "saved" },
            { savedUntil: { gt: now } },
          ],
        },
      ],
      ...(excludeArr.length > 0 ? { urlHash: { notIn: excludeArr } } : {}),
    },
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
