/**
 * Discovery carry-over queue — saved trends skip external API re-fetch.
 * @see IMPLEMENTATION-PLAN.md §4.5
 */

import type { Trend } from "@prisma/client";
import type { TrendFeedbackStatus } from "@/types";

export const POOL_TARGET = 10;
export const MAX_SAVED_CARRY = 10;
/** Days a saved topic stays valid when refreshed via thumbs up */
export const SAVED_TOPIC_TTL_DAYS = 5;

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
    newFetchBudget: Math.max(0, POOL_TARGET - capped),
  };
}

export function savedUntilFromNow(now = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + SAVED_TOPIC_TTL_DAYS);
  return d;
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
      savedUntil: savedUntilFromNow(now),
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
  if (trend.feedbackStatus === "saved" && trend.savedUntil && trend.savedUntil > now) {
    return true;
  }
  return trend.expiresAt > now;
}
