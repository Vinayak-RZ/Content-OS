/** Client-safe trend row shape (no Prisma imports). */
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
