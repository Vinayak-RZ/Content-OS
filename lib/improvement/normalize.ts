import type { DimensionBreakdown, PerformanceAnalysis, PerformancePostRow } from "@/lib/improvement/types";

type LegacyStats = {
  postsAnalyzed?: number;
  postsFromContentOs?: number;
  postsExternal?: number;
  postsAttributed?: number;
  postsUnattributed?: number;
  avgImpressions?: number;
  avgEngagementRate?: number;
};

function normalizeStats(raw: LegacyStats | undefined): PerformanceAnalysis["stats"] {
  const postsAnalyzed = raw?.postsAnalyzed ?? 0;
  const postsFromContentOs = raw?.postsFromContentOs ?? 0;
  const postsExternal = raw?.postsExternal ?? 0;
  const postsAttributed =
    raw?.postsAttributed ?? postsFromContentOs + postsExternal;
  const postsUnattributed =
    raw?.postsUnattributed ?? Math.max(0, postsAnalyzed - postsAttributed);

  return {
    postsAnalyzed,
    postsFromContentOs,
    postsAttributed,
    postsUnattributed,
    avgImpressions: raw?.avgImpressions ?? 0,
    avgEngagementRate: raw?.avgEngagementRate ?? 0,
  };
}

function normalizePostRow(raw: Partial<PerformancePostRow>): PerformancePostRow {
  return {
    id: raw.id ?? "",
    textPreview: raw.textPreview ?? "",
    platform: raw.platform ?? "unknown",
    publishedAt: raw.publishedAt ?? null,
    impressions: raw.impressions ?? null,
    reactions: raw.reactions ?? null,
    comments: raw.comments ?? null,
    reposts: raw.reposts ?? null,
    engagementRate: raw.engagementRate ?? null,
    draftId: raw.draftId ?? null,
    draftTitle: raw.draftTitle ?? null,
    trendId: raw.trendId ?? null,
    pipeline: raw.pipeline ?? null,
    sourceType: raw.sourceType ?? null,
    tags: raw.tags ?? [],
    contentDomain: raw.contentDomain ?? "general",
    contentDomainLabel: raw.contentDomainLabel ?? "General",
    attributionConfidence: raw.attributionConfidence ?? null,
    attributionMethod: raw.attributionMethod ?? null,
    isAttributed: raw.isAttributed ?? false,
    lengthBucket: raw.lengthBucket ?? "unknown",
  };
}

function normalizeBreakdown(rows: DimensionBreakdown[] | undefined): DimensionBreakdown[] {
  return (rows ?? []).map((row) => ({
    key: row.key ?? "unknown",
    label: row.label ?? row.key ?? "Unknown",
    count: row.count ?? 0,
    avgImpressions: row.avgImpressions ?? 0,
    avgEngagementRate: row.avgEngagementRate ?? 0,
  }));
}

/** Coerce stored or legacy API payloads into the current PerformanceAnalysis shape. */
export function normalizePerformanceAnalysis(
  input: unknown,
): PerformanceAnalysis | null {
  if (!input || typeof input !== "object") return null;

  const raw = input as Partial<PerformanceAnalysis> & {
    stats?: LegacyStats;
    breakdowns?: Partial<PerformanceAnalysis["breakdowns"]> & {
      topics?: DimensionBreakdown[];
      tags?: DimensionBreakdown[];
    };
  };

  const breakdowns = (raw.breakdowns ?? {}) as Partial<
    PerformanceAnalysis["breakdowns"]
  > & {
    topics?: DimensionBreakdown[];
    tags?: DimensionBreakdown[];
  };

  return {
    sufficientData: raw.sufficientData ?? false,
    minPostsRequired: raw.minPostsRequired ?? 3,
    stats: normalizeStats(raw.stats),
    whatsWorking: raw.whatsWorking ?? [],
    whatsNotWorking: raw.whatsNotWorking ?? [],
    topPerformers: (raw.topPerformers ?? []).map((row) =>
      normalizePostRow(row as Partial<PerformancePostRow>),
    ),
    bottomPerformers: (raw.bottomPerformers ?? []).map((row) =>
      normalizePostRow(row as Partial<PerformancePostRow>),
    ),
    breakdowns: {
      domains: normalizeBreakdown(
        breakdowns.domains ?? breakdowns.topics ?? breakdowns.tags,
      ),
      platform: normalizeBreakdown(breakdowns.platform),
      lengthBucket: normalizeBreakdown(breakdowns.lengthBucket),
    },
  };
}
