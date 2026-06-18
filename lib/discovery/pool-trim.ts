import { prisma } from "@/lib/db";
import { DISCOVERY_VISIBLE_POOL_MAX } from "@/lib/discovery/founder-profile";
import type { ContentPipeline } from "@/lib/pipelines/types";
import { getExcludedUrlHashesForDashboard } from "@/lib/topic-memory";

/**
 * Keep the visible undrafted backlog at most `maxVisible` topics.
 * Lowest finalScore non-saved rows are expired first.
 */
export async function trimVisibleTopicPool(
  userId: string,
  pipeline: ContentPipeline = "signals",
  maxVisible = DISCOVERY_VISIBLE_POOL_MAX,
): Promise<number> {
  const now = new Date();
  const draftedHashes = await getExcludedUrlHashesForDashboard(userId);
  const excludeArr = Array.from(draftedHashes);

  const active = await prisma.trend.findMany({
    where: {
      userId,
      pipeline,
      OR: [{ feedbackStatus: null }, { feedbackStatus: "saved" }],
      expiresAt: { gt: now },
      ...(excludeArr.length > 0 ? { urlHash: { notIn: excludeArr } } : {}),
    },
    orderBy: [{ finalScore: "desc" }, { discoveredAt: "desc" }],
    select: { id: true, feedbackStatus: true },
  });

  if (active.length <= maxVisible) return 0;

  const toExpire = active.slice(maxVisible).filter((t) => t.feedbackStatus !== "saved");
  if (toExpire.length === 0) return 0;

  await prisma.trend.updateMany({
    where: { id: { in: toExpire.map((t) => t.id) } },
    data: { expiresAt: now },
  });

  return toExpire.length;
}
