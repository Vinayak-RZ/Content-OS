import { prisma } from "@/lib/db";
import {
  buildPublicationByDay,
  type DayCount,
} from "@/lib/analytics/date-buckets";

export type { DayCount };

export type AnalyticsSummary = {
  publishedCount: number;
  discoveryRunsTotal: number;
  discoveryRunsToday: number;
  publishedThisWeek: number;
  publishedByDay: DayCount[];
  recentPublished: {
    id: string;
    topicTitle: string;
    updatedAt: string;
  }[];
};

export async function fetchAnalyticsSummary(
  userId: string,
): Promise<AnalyticsSummary> {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [publishedDrafts, discoveryRunsTotal, discoveryRunsToday, recentPublished] =
    await Promise.all([
      prisma.draft.findMany({
        where: { userId, status: "published" },
        select: { id: true, topicTitle: true, updatedAt: true, publishedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.cronLog.count({ where: { userId } }),
      prisma.cronLog.count({
        where: { userId, runAt: { gte: todayStart } },
      }),
      prisma.draft.findMany({
        where: { userId, status: "published" },
        select: { id: true, topicTitle: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
    ]);

  const { publishedByDay, publishedThisWeek } = buildPublicationByDay(
    publishedDrafts
      .map((d) => d.publishedAt ?? d.updatedAt)
      .filter((d): d is Date => d != null),
    now,
  );

  return {
    publishedCount: publishedDrafts.length,
    discoveryRunsTotal,
    discoveryRunsToday,
    publishedThisWeek,
    publishedByDay,
    recentPublished: recentPublished.map((d) => ({
      id: d.id,
      topicTitle: d.topicTitle,
      updatedAt: d.updatedAt.toISOString(),
    })),
  };
}
