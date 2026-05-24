/**
 * Topic engagements — selected / published — for ranking originality and dashboard filtering.
 * @see IMPLEMENTATION-PLAN.md §5
 */

import { randomUUID } from "crypto";

import { prisma } from "@/lib/db";
import { embedTexts } from "@/lib/knowledge/embed";
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

/** After generate draft — embedding title+summary for originality signal. */
export async function recordTopicEngagementSelected(params: {
  userId: string;
  trendId: string | null;
  draftId: string;
  topicTitle: string;
  summaryForEmbed: string;
  urlHash: string | null;
}): Promise<void> {
  const embedText =
    `${params.topicTitle}\n${params.summaryForEmbed}`.slice(0, 8000);
  const vectors = await embedTexts([embedText]);
  const vec = vectors[0];
  if (!vec || vec.length !== 1536) {
    throw new Error("Embedding failed for topic engagement");
  }
  const vectorLiteral = `[${vec.join(",")}]`;

  const existing =
    params.urlHash != null
      ? await prisma.topicEngagement.findFirst({
          where: { userId: params.userId, urlHash: params.urlHash },
          select: { id: true },
        })
      : null;

  if (existing) {
    await prisma.$executeRawUnsafe(
      `UPDATE "TopicEngagement"
       SET "draftId" = $1,
           "trendId" = $2,
           "topicTitle" = $3,
           "topicEmbedding" = $4::vector,
           "status" = 'selected',
           "selectedAt" = NOW(),
           "publishedAt" = NULL
       WHERE "id" = $5::uuid`,
      params.draftId,
      params.trendId,
      params.topicTitle.slice(0, 500),
      vectorLiteral,
      existing.id,
    );
    return;
  }

  const id = randomUUID();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "TopicEngagement"
      ("id","userId","trendId","draftId","urlHash","topicTitle","topicEmbedding","status","selectedAt","publishedAt")
     VALUES ($1::uuid,$2,$3,$4,$5,$6,$7::vector,'selected',NOW(),NULL)`,
    id,
    params.userId,
    params.trendId,
    params.draftId,
    params.urlHash,
    params.topicTitle.slice(0, 500),
    vectorLiteral,
  );
}

export async function markTopicEngagementPublishedForDraft(
  userId: string,
  draftId: string,
): Promise<void> {
  await prisma.topicEngagement.updateMany({
    where: { userId, draftId },
    data: {
      status: "published",
      publishedAt: new Date(),
    },
  });
}
