export type DayCount = { date: string; count: number };

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function buildPublicationByDay(
  publishedAtDates: Date[],
  now = new Date(),
): { publishedByDay: DayCount[]; publishedThisWeek: number } {
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const chartStart = new Date(todayStart);
  chartStart.setDate(chartStart.getDate() - 13);

  const dayMap = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(chartStart);
    d.setDate(d.getDate() + i);
    dayMap.set(formatDateKey(d), 0);
  }

  let publishedThisWeek = 0;

  for (const publishedAt of publishedAtDates) {
    if (publishedAt >= weekStart) publishedThisWeek += 1;
    if (publishedAt < chartStart) continue;
    const key = formatDateKey(publishedAt);
    if (dayMap.has(key)) {
      dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }
  }

  const publishedByDay = Array.from(dayMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return { publishedByDay, publishedThisWeek };
}
