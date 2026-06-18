import type { ContentPipeline } from "@/lib/pipelines/types";

export type SignalsWeightKey =
  | "technical"
  | "momentum"
  | "founder"
  | "original"
  | "writing";

export type StudioWeightKey =
  | "studio"
  | "founder"
  | "brand"
  | "writing"
  | "original"
  | "momentum"
  | "technical";

export type ResolvedRankingWeights = Record<string, number>;

export const DEFAULT_SIGNALS_WEIGHTS: Record<SignalsWeightKey, number> = {
  technical: 0.4,
  momentum: 0.25,
  founder: 0.2,
  original: 0.1,
  writing: 0.05,
};

export const DEFAULT_STUDIO_WEIGHTS: Record<StudioWeightKey, number> = {
  studio: 0.4,
  founder: 0.25,
  brand: 0.15,
  writing: 0.15,
  original: 0.05,
  momentum: 0,
  technical: 0,
};

export function normalizeWeights(
  weights: Record<string, number>,
): Record<string, number> {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  if (sum <= 0) return weights;
  const normalized: Record<string, number> = {};
  for (const [k, v] of Object.entries(weights)) {
    normalized[k] = v / sum;
  }
  return normalized;
}

export function getRankingWeights(
  pipeline: ContentPipeline,
  overrides?: {
    signals?: Partial<Record<SignalsWeightKey, number>>;
    studio?: Partial<Record<StudioWeightKey, number>>;
  } | null,
): ResolvedRankingWeights {
  if (pipeline === "studio") {
    return normalizeWeights({
      ...DEFAULT_STUDIO_WEIGHTS,
      ...overrides?.studio,
    });
  }
  return normalizeWeights({
    ...DEFAULT_SIGNALS_WEIGHTS,
    ...overrides?.signals,
  });
}

export const SIGNALS_WEIGHT_LABELS: Record<SignalsWeightKey, string> = {
  technical: "Technical alignment",
  momentum: "Trend momentum",
  founder: "Founder relevance",
  original: "Originality",
  writing: "Writing compatibility",
};

export const STUDIO_WEIGHT_LABELS: Record<StudioWeightKey, string> = {
  studio: "Studio fit",
  founder: "Founder relevance",
  brand: "Brand fit",
  writing: "Writing compatibility",
  original: "Originality",
  momentum: "Trend momentum",
  technical: "Technical alignment",
};
