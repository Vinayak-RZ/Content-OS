/**
 * Topic engagements — selected / published — for ranking originality and dashboard filtering.
 * @see IMPLEMENTATION-PLAN.md §5
 */

import { prisma } from "@/lib/db";
import { parsePgVectorText } from "@/lib/vector/math";

export const TOPIC_MEMORY_SELECTED_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

/** Embeddings used for originalityPotential (published + recently selected). */
export async function getEngagementVectorsForOriginality(
  userId: string,
): Promise<number[][]> {
  const since = new Date(Date.now() - TOPIC_MEMORY_SELECTED_WINDOW_MS);
  const rows = await prisma.$queryRaw<{ emb: string | null }[]>`
    SELECT "topicEmbedding"::text AS emb
    FROM "TopicEngagement"
    WHERE "userId" = ${userId}
      AND "topicEmbedding" IS NOT NULL
      AND (
        status = 'published'
        OR (status = 'selected' AND "selectedAt" >= ${since})
      )
  `;
  const out: number[][] = [];
  for (const r of rows) {
    const v = parsePgVectorText(r.emb);
    if (v && v.length > 0) out.push(v);
  }
  return out;
}

/**
 * URL hashes the user has already covered — hide from GET /api/trends (published + recent selected).
 */
export async function getExcludedUrlHashesForDashboard(
  userId: string,
): Promise<Set<string>> {
  const since = new Date(Date.now() - TOPIC_MEMORY_SELECTED_WINDOW_MS);
  const rows = await prisma.topicEngagement.findMany({
    where: {
      userId,
      urlHash: { not: null },
      OR: [
        { status: "published" },
        { status: "selected", selectedAt: { gte: since } },
      ],
    },
    select: { urlHash: true },
  });
  const set = new Set<string>();
  for (const r of rows) {
    if (r.urlHash) set.add(r.urlHash);
  }
  return set;
}
