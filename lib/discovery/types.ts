import type { SourceType } from "@/types";

/** Normalized discovery item before persistence (no LLM). */
export type TrendCandidate = {
  title: string;
  url: string;
  summary: string;
  source: string;
  sourceType: SourceType;
  tags: string[];
  trendScore: number;
  discoveredAt: Date;
  metadata?: Record<string, unknown>;
};

export type AdapterRunResult = {
  sourceType: SourceType;
  fetched: number;
  candidates: TrendCandidate[];
};

export type DiscoverySourceCountsJson = Record<string, number>;
