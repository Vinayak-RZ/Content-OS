/**
 * Discovery carry-over queue - saved trends skip external API re-fetch.
 * @see IMPLEMENTATION-PLAN.md §4.5
 */

import type { Trend } from "@prisma/client";
import type { TrendFeedbackStatus } from "@/types";
import { prisma } from "@/lib/db";
import type { TrendCandidate } from "@/lib/discovery/types";
import type { ContentPipeline } from "@/lib/pipelines/types";
import { canonicalizeUrl } from "@/lib/discovery/urls";

import {
  DISCOVERY_MAX_SAVED_CARRY,
  DISCOVERY_NEW_PER_RUN,
} from "@/lib/discovery/founder-profile";

export const POOL_TARGET = DISCOVERY_NEW_PER_RUN;
export const MAX_SAVED_CARRY = DISCOVERY_MAX_SAVED_CARRY;

export type DiscoveryFetchBudget = {
  poolTarget: number;
  savedCount: number;
  newFetchBudget: number;
};

export function computeFetchBudget(savedCount: number): DiscoveryFetchBudget {
  const capped = Math.min(Math.max(0, savedCount), MAX_SAVED_CARRY);
  return {
    poolTarget: POOL_TARGET,
    savedCount: capped,
    /** New topics per run - not reduced by saved carry-over. */
    newFetchBudget: POOL_TARGET,
  };
}

export type FeedbackPatch = TrendFeedbackStatus | null;

export function feedbackPatchToFields(
  feedback: FeedbackPatch,
  now = new Date(),
): Pick<Trend, "feedbackStatus" | "feedbackAt" | "savedUntil"> {
  if (feedback === "saved") {
    return {
      feedbackStatus: "saved",
      feedbackAt: now,
      /** null = no expiry while saved (exempt from pool TTL). */
      savedUntil: null,
    };
  }
  if (feedback === "dismissed") {
    return {
      feedbackStatus: "dismissed",
      feedbackAt: now,
      savedUntil: null,
    };
  }
  return {
    feedbackStatus: null,
    feedbackAt: null,
    savedUntil: null,
  };
}

export function isTrendActiveForDashboard(
  trend: Pick<Trend, "feedbackStatus" | "expiresAt" | "savedUntil">,
  now = new Date(),
): boolean {
  if (trend.feedbackStatus === "dismissed") {
    return false;
  }
  if (trend.feedbackStatus === "saved") {
    return true;
  }
  return trend.expiresAt > now;
}

/** Saved thumbs-up rows eligible for carry-over (no API re-fetch). */
export async function getSavedTrendsForDiscovery(
  userId: string,
  pipeline: ContentPipeline = "signals",
): Promise<Trend[]> {
  const now = new Date();
  return prisma.trend.findMany({
    where: {
      userId,
      pipeline,
      feedbackStatus: "saved",
      OR: [{ savedUntil: null }, { savedUntil: { gt: now } }],
    },
    orderBy: { feedbackAt: "desc" },
    take: MAX_SAVED_CARRY,
  });
}

export function trendRowToCandidate(trend: Trend): TrendCandidate {
  return {
    title: trend.title,
    url: canonicalizeUrl(trend.url),
    summary: trend.summary,
    source: trend.source,
    sourceType: trend.sourceType as TrendCandidate["sourceType"],
    tags: trend.tags,
    trendScore: trend.trendScore,
    discoveredAt: trend.discoveredAt,
    metadata: { carriedFromTrendId: trend.id, carriedOver: true },
  };
}
