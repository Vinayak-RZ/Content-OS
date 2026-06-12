import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { DiscoveryRunResult } from "@/lib/discovery/orchestrator";

/** Immutable snapshot of a discovery run for the research history page. */
export async function persistDiscoveryRunSnapshot(
  result: DiscoveryRunResult,
  durationMs: number,
): Promise<void> {
  await prisma.discoveryRun.create({
    data: {
      userId: result.userId,
      batchId: result.batchId,
      success: true,
      sourceCounts: result.sourceCounts as unknown as Prisma.InputJsonValue,
      totalDiscovered: result.newStored + result.carriedOver,
      newStored: result.newStored,
      carriedOver: result.carriedOver,
      durationMs,
      topics: {
        create: result.topics.map((t) => ({
          trendId: t.trendId,
          topicTitle: t.topicTitle,
          finalScore: t.finalScore,
          source: t.source,
          role: t.role,
        })),
      },
    },
  });
}
