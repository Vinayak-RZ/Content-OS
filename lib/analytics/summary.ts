import { prisma } from "@/lib/db";

export type DayCount = { date: string; count: number };

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

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function fetchAnalyticsSummary(
  userId: string,
): Promise<AnalyticsSummary> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const chartStart = new Date(todayStart);
  chartStart.setDate(chartStart.getDate() - 13);

  const [publishedDrafts, discoveryRunsTotal, discoveryRunsToday, recentPublished] =
    await Promise.all([
      prisma.draft.findMany({
        where: { userId, status: "published" },
        select: { id: true, topicTitle: true, updatedAt: true },
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

  const publishedThisWeek = publishedDrafts.filter(
    (d) => d.updatedAt >= weekStart,
  ).length;

  const dayMap = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(chartStart);
    d.setDate(d.getDate() + i);
    dayMap.set(formatDateKey(d), 0);
  }

  for (const draft of publishedDrafts) {
    if (draft.updatedAt < chartStart) continue;
    const key = formatDateKey(draft.updatedAt);
    if (dayMap.has(key)) {
      dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }
  }

  const publishedByDay = Array.from(dayMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

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
