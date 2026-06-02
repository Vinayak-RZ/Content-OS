import { randomUUID } from "crypto";

import type { TrendCandidate } from "@/lib/discovery/types";
import { TOPIC_POOL_EXPIRES_MS } from "@/lib/discovery/topic-pool-ttl";
import type { SerializedDashboardTrend } from "@/lib/trends/types";

export function serializeGuestTrend(
  candidate: TrendCandidate,
  batchId: string,
  finalScore: number,
): SerializedDashboardTrend {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOPIC_POOL_EXPIRES_MS);
  return {
    id: randomUUID(),
    title: candidate.title.slice(0, 240),
    source: candidate.source.slice(0, 120),
    url: candidate.url,
    summary: candidate.summary.slice(0, 2400),
    trendScore: candidate.trendScore,
    finalScore,
    tags: candidate.tags.slice(0, 20),
    sourceType: candidate.sourceType,
    discoveredAt: candidate.discoveredAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    feedbackAt: null,
    savedUntil: null,
    feedbackStatus: null,
    discoveryBatchId: batchId,
  };
}
