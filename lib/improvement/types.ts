import type { ContentPipeline } from "@/lib/pipelines/types";

export type ImprovementStep =
  | "sync"
  | "attribute"
  | "analyze"
  | "research"
  | "insights"
  | "proposals";

export type ImprovementRunStatus = "running" | "completed" | "failed";

export type LinkedInResearchSource = {
  title: string;
  snippet: string;
  url: string;
};

export type LinkedInResearchResult = {
  sources: LinkedInResearchSource[];
  synthesis: string;
};

export type PerformanceInsightBullet = {
  text: string;
  metric?: string;
  value?: number;
};

export type PerformancePostRow = {
  id: string;
  textPreview: string;
  platform: string;
  publishedAt: string | null;
  impressions: number | null;
  reactions: number | null;
  comments: number | null;
  reposts: number | null;
  engagementRate: number | null;
  draftId: string | null;
  draftTitle: string | null;
  trendId: string | null;
  pipeline: string | null;
  sourceType: string | null;
  tags: string[];
  contentDomain: string;
  contentDomainLabel: string;
  attributionConfidence: number | null;
  attributionMethod: string | null;
  isAttributed: boolean;
  lengthBucket: string;
};

export type DimensionBreakdown = {
  key: string;
  label: string;
  count: number;
  avgImpressions: number;
  avgEngagementRate: number;
};

export type PerformanceAnalysis = {
  sufficientData: boolean;
  minPostsRequired: number;
  stats: {
    postsAnalyzed: number;
    postsAttributed: number;
    postsUnattributed: number;
    postsFromContentOs: number;
    avgImpressions: number;
    avgEngagementRate: number;
  };
  whatsWorking: PerformanceInsightBullet[];
  whatsNotWorking: PerformanceInsightBullet[];
  topPerformers: PerformancePostRow[];
  bottomPerformers: PerformancePostRow[];
  breakdowns: {
    domains: DimensionBreakdown[];
    platform: DimensionBreakdown[];
    lengthBucket: DimensionBreakdown[];
  };
};

export type InsightFileUpdate = {
  slug: string;
  fileName: string;
  fileVersion: number;
};

export type ProposalSummary = {
  id: string;
  type: string;
  title: string;
};

export type ImprovementRunSummary = {
  analysis: PerformanceAnalysis;
  linkedinResearch: LinkedInResearchResult;
  insightFilesUpdated: InsightFileUpdate[];
  proposalsCreated: ProposalSummary[];
  stats: {
    postsAnalyzed: number;
    postsAttributed: number;
    postsUnattributed: number;
    postsFromContentOs: number;
  };
};

export type SignalsRankingWeights = {
  technical: number;
  momentum: number;
  founder: number;
  original: number;
  writing: number;
};

export type StudioRankingWeights = {
  studio: number;
  founder: number;
  brand: number;
  writing: number;
  original: number;
  momentum: number;
  technical: number;
};

export type UserRankingWeights = {
  signals?: Partial<SignalsRankingWeights>;
  studio?: Partial<StudioRankingWeights>;
};

export type RankingWeightsProposal = {
  pipeline: ContentPipeline;
  current: Record<string, number>;
  proposed: Record<string, number>;
};

export type StyleEditProposal = {
  slug: string;
  currentContent: string;
  proposedContent: string;
};

export const MIN_POSTS_FOR_LEARNING = 3;

/** @deprecated Attribution no longer gates learning */
export const MIN_ATTRIBUTED_POSTS_FOR_LEARNING = MIN_POSTS_FOR_LEARNING;
export const ATTRIBUTION_CONFIDENCE_THRESHOLD = 0.75;
