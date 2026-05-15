import type { Trend } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { TrendCandidate } from "@/lib/discovery/types";
import { embedTexts } from "@/lib/knowledge/embed";
import { getEngagementVectorsForOriginality } from "@/lib/topic-memory";
import {
  clamp01,
  cosineSimilarity,
  parsePgVectorText,
} from "@/lib/vector/math";

/** Cursor prompt §ranking — weights sum to 1. */
const W_TECH = 0.4;
const W_MOMENTUM = 0.25;
const W_FOUNDER = 0.2;
const W_ORIGINAL = 0.1;
const W_WRITING = 0.05;

type RankRow = {
  trendMomentum: number;
  title: string;
  summary: string;
  tags: string[];
};

async function avgCentroidSingleFile(
  userId: string,
  fileName: string,
): Promise<number[] | null> {
  const rows = await prisma.$queryRaw<{ centroid: string | null }[]>`
    SELECT AVG(embedding)::text AS centroid
    FROM "KnowledgeChunk"
    WHERE "userId" = ${userId}
      AND "fileName" = ${fileName}
      AND embedding IS NOT NULL
  `;
  return parsePgVectorText(rows[0]?.centroid ?? null);
}

async function avgCentroidFounder(userId: string): Promise<number[] | null> {
  const rows = await prisma.$queryRaw<{ centroid: string | null }[]>`
    SELECT AVG(embedding)::text AS centroid
    FROM "KnowledgeChunk"
    WHERE "userId" = ${userId}
      AND "fileName" IN ('startup-journey.md', 'soul.md')
      AND embedding IS NOT NULL
  `;
  return parsePgVectorText(rows[0]?.centroid ?? null);
}

function trendEmbeddingInputs(rows: RankRow[]): string[] {
  return rows.map((r) =>
    `${r.title}\n\n${r.summary}`.slice(0, 8000),
  );
}

function tagEmbeddingInputs(rows: RankRow[]): string[] {
  return rows.map((r) =>
    (r.tags.length > 0 ? r.tags.join(", ") : r.title).slice(0, 2000),
  );
}

function fallbackScores(rows: RankRow[]): number[] {
  return rows.map((r) => clamp01(r.trendMomentum));
}

/**
 * Deterministic 5-signal ranking. Same order as `carried` then `newcomers`.
 * On embedding failure, falls back to adapter momentum (`trendScore`).
 */
export async function rankDiscoveryPool(
  userId: string,
  carried: Trend[],
  newcomers: TrendCandidate[],
): Promise<number[]> {
  const rows: RankRow[] = [
    ...carried.map((t) => ({
      trendMomentum: t.trendScore,
      title: t.title,
      summary: t.summary,
      tags: t.tags,
    })),
    ...newcomers.map((c) => ({
      trendMomentum: c.trendScore,
      title: c.title,
      summary: c.summary,
      tags: c.tags,
    })),
  ];

  if (rows.length === 0) return [];

  try {
    const [technicalCentroid, founderCentroid, writingCentroid, memoryVecs] =
      await Promise.all([
        avgCentroidSingleFile(userId, "technical-interests.md"),
        avgCentroidFounder(userId),
        avgCentroidSingleFile(userId, "writing-style.md"),
        getEngagementVectorsForOriginality(userId),
      ]);

    const trendTexts = trendEmbeddingInputs(rows);
    const tagTexts = tagEmbeddingInputs(rows);
    const embedded = await embedTexts([...trendTexts, ...tagTexts]);
    const n = rows.length;
    const trendEmb = embedded.slice(0, n);
    const tagEmb = embedded.slice(n);

    const scores: number[] = [];
    for (let i = 0; i < n; i += 1) {
      const row = rows[i];
      const te = trendEmb[i];
      const tg = tagEmb[i];
      if (!row || !te || !tg) {
        scores.push(clamp01(row?.trendMomentum ?? 0));
        continue;
      }

      const technicalAlignment = technicalCentroid
        ? clamp01(cosineSimilarity(te, technicalCentroid))
        : 0.5;
      const founderRelevance = founderCentroid
        ? clamp01(cosineSimilarity(te, founderCentroid))
        : 0.5;
      const writingCompatibility = writingCentroid
        ? clamp01(cosineSimilarity(tg, writingCentroid))
        : 0.5;

      let originalityPotential = 1;
      if (memoryVecs.length > 0) {
        let maxSim = 0;
        for (const mv of memoryVecs) {
          maxSim = Math.max(maxSim, cosineSimilarity(te, mv));
        }
        originalityPotential = clamp01(1 - maxSim);
      }

      const trendMomentum = clamp01(row.trendMomentum);

      const finalScore =
        technicalAlignment * W_TECH +
        trendMomentum * W_MOMENTUM +
        founderRelevance * W_FOUNDER +
        originalityPotential * W_ORIGINAL +
        writingCompatibility * W_WRITING;

      scores.push(clamp01(finalScore));
    }
    return scores;
  } catch (err) {
    console.warn("[ranking] falling back to trendScore:", err);
    return fallbackScores(rows);
  }
}
