import { prisma } from "@/lib/db";

export type ResearchRunTopic = {
  id: string;
  topicTitle: string;
  finalScore: number;
  source: string | null;
  role: string;
};

export type ResearchRunSummary = {
  id: string;
  runAt: string;
  newStored: number;
  carriedOver: number;
  totalDiscovered: number;
  durationMs: number;
  topics: ResearchRunTopic[];
};

export type ResearchDayGroup = {
  dateLabel: string;
  dateKey: string;
  runs: ResearchRunSummary[];
};

export async function fetchResearchHistory(
  userId: string,
): Promise<ResearchDayGroup[]> {
  const runs = await prisma.discoveryRun.findMany({
    where: { userId, success: true },
    orderBy: { runAt: "desc" },
    take: 60,
    include: {
      topics: {
        orderBy: { finalScore: "desc" },
      },
    },
  });

  const groups = new Map<string, ResearchDayGroup>();

  for (const run of runs) {
    const dateKey = run.runAt.toISOString().slice(0, 10);
    const dateLabel = run.runAt.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const summary: ResearchRunSummary = {
      id: run.id,
      runAt: run.runAt.toISOString(),
      newStored: run.newStored,
      carriedOver: run.carriedOver,
      totalDiscovered: run.totalDiscovered,
      durationMs: run.durationMs,
      topics: run.topics.map((t) => ({
        id: t.id,
        topicTitle: t.topicTitle,
        finalScore: t.finalScore,
        source: t.source,
        role: t.role,
      })),
    };

    const existing = groups.get(dateKey);
    if (existing) {
      existing.runs.push(summary);
    } else {
      groups.set(dateKey, {
        dateKey,
        dateLabel,
        runs: [summary],
      });
    }
  }

  return Array.from(groups.values());
}
