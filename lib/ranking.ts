import type { Trend } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { TrendCandidate } from "@/lib/discovery/types";
import type { KnowledgeRole } from "@/lib/knowledge/constants";
import type { ContentPipeline } from "@/lib/pipelines/types";
import { getUserRankingWeights } from "@/lib/improvement/ranking-weights";
import { getRankingWeights } from "@/lib/improvement/weights";
import { embedTexts } from "@/lib/knowledge/embed";
import { getEngagementVectorsForOriginality } from "@/lib/topic-memory";
import {
  clamp01,
  cosineSimilarity,
  parsePgVectorText,
} from "@/lib/vector/math";

/** Default Signals pipeline weights (used when no user override). */
const SIGNALS_W_TECH = 0.4;
const SIGNALS_W_MOMENTUM = 0.25;
const SIGNALS_W_FOUNDER = 0.2;
const SIGNALS_W_ORIGINAL = 0.1;
const SIGNALS_W_WRITING = 0.05;

/** Default Studio pipeline weights. */
const STUDIO_W_STUDIO = 0.4;
const STUDIO_W_FOUNDER = 0.25;
const STUDIO_W_BRAND = 0.15;
const STUDIO_W_WRITING = 0.15;
const STUDIO_W_ORIGINAL = 0.05;
const STUDIO_W_MOMENTUM = 0;
const STUDIO_W_TECH = 0;

type RankRow = {
  trendMomentum: number;
  title: string;
  summary: string;
  tags: string[];
};

async function avgCentroidByRole(
  userId: string,
  role: KnowledgeRole,
): Promise<number[] | null> {
  const rows = await prisma.$queryRaw<{ centroid: string | null }[]>`
    SELECT AVG(kc.embedding)::text AS centroid
    FROM "KnowledgeChunk" kc
    INNER JOIN "KnowledgeFile" kf
      ON kf."userId" = kc."userId" AND kf."fileName" = kc."fileName"
    WHERE kc."userId" = ${userId}
      AND kf."role" = ${role}
      AND kc.embedding IS NOT NULL
  `;
  return parsePgVectorText(rows[0]?.centroid ?? null);
}

/** Founder relevance for Signals: narrative + brand. */
async function avgCentroidFounderCombined(
  userId: string,
): Promise<number[] | null> {
  const rows = await prisma.$queryRaw<{ centroid: string | null }[]>`
    SELECT AVG(kc.embedding)::text AS centroid
    FROM "KnowledgeChunk" kc
    INNER JOIN "KnowledgeFile" kf
      ON kf."userId" = kc."userId" AND kf."fileName" = kc."fileName"
    WHERE kc."userId" = ${userId}
      AND kf."role" IN ('narrative', 'brand')
      AND kc.embedding IS NOT NULL
  `;
  return parsePgVectorText(rows[0]?.centroid ?? null);
}

/** Narrative-only centroid for Studio ranking. */
async function avgCentroidNarrative(userId: string): Promise<number[] | null> {
  return avgCentroidByRole(userId, "narrative");
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
  pipeline: ContentPipeline = "signals",
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

  const isStudio = pipeline === "studio";
  const userWeights = await getUserRankingWeights(userId);
  const weights = getRankingWeights(pipeline, userWeights);

  const wTech = weights.technical ?? (isStudio ? STUDIO_W_TECH : SIGNALS_W_TECH);
  const wMomentum = weights.momentum ?? (isStudio ? STUDIO_W_MOMENTUM : SIGNALS_W_MOMENTUM);
  const wFounder = weights.founder ?? (isStudio ? STUDIO_W_FOUNDER : SIGNALS_W_FOUNDER);
  const wOriginal = weights.original ?? (isStudio ? STUDIO_W_ORIGINAL : SIGNALS_W_ORIGINAL);
  const wWriting = weights.writing ?? (isStudio ? STUDIO_W_WRITING : SIGNALS_W_WRITING);
  const wStudio = weights.studio ?? STUDIO_W_STUDIO;
  const wBrand = weights.brand ?? STUDIO_W_BRAND;

  try {
    const [
      technicalCentroid,
      founderCentroid,
      brandCentroid,
      studioCentroid,
      writingCentroid,
      memoryVecs,
    ] = await Promise.all([
      avgCentroidByRole(userId, "technical"),
      isStudio ? avgCentroidNarrative(userId) : avgCentroidFounderCombined(userId),
      isStudio ? avgCentroidByRole(userId, "brand") : Promise.resolve(null),
      isStudio ? avgCentroidByRole(userId, "studio") : Promise.resolve(null),
      avgCentroidByRole(userId, "style"),
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
      const brandFit = brandCentroid
        ? clamp01(cosineSimilarity(te, brandCentroid))
        : 0.5;
      const studioFit = studioCentroid
        ? clamp01(cosineSimilarity(te, studioCentroid))
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

      const finalScore = isStudio
        ? studioFit * wStudio +
          founderRelevance * wFounder +
          brandFit * wBrand +
          writingCompatibility * wWriting +
          originalityPotential * wOriginal +
          trendMomentum * wMomentum +
          technicalAlignment * wTech
        : technicalAlignment * wTech +
          trendMomentum * wMomentum +
          founderRelevance * wFounder +
          originalityPotential * wOriginal +
          writingCompatibility * wWriting;

      scores.push(clamp01(finalScore));
    }
    return scores;
  } catch (err) {
    console.warn("[ranking] falling back to trendScore:", err);
    return fallbackScores(rows);
  }
}
