export type SerializedDashboardTrend = {
  id: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  trendScore: number;
  finalScore: number;
  tags: string[];
  sourceType: string;
  discoveredAt: string;
  expiresAt: string;
  feedbackAt: string | null;
  savedUntil: string | null;
  feedbackStatus: string | null;
  discoveryBatchId: string | null;
};

export type SettingsKeys = {
  tavily: boolean;
  firecrawl: boolean;
  openrouter: boolean;
  nvidia: boolean;
  openai: boolean;
};

export function countConfiguredKeys(keys: SettingsKeys): {
  configured: number;
  total: number;
} {
  const values = Object.values(keys);
  return {
    configured: values.filter(Boolean).length,
    total: values.length,
  };
}
