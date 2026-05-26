import { DISCOVERY_NOISE_PATTERNS } from "@/lib/discovery/founder-profile";
import type { TrendCandidate } from "@/lib/discovery/types";

const MIN_SUMMARY_CHARS = 40;
const MIN_TITLE_CHARS = 12;

function topicText(c: TrendCandidate): string {
  return `${c.title} ${c.summary} ${c.tags.join(" ")}`.toLowerCase();
}

/** Drop spam and empty/low-effort items only. */
export function isDiscoveryNoise(candidate: TrendCandidate): boolean {
  const text = topicText(candidate);
  if (DISCOVERY_NOISE_PATTERNS.some((re) => re.test(text))) {
    return true;
  }
  if (candidate.title.trim().length < MIN_TITLE_CHARS) return true;
  if (candidate.summary.trim().length < MIN_SUMMARY_CHARS) {
    return true;
  }
  return false;
}

/**
 * Light quality nudge only — ranking + your Knowledge files decide fit.
 * Slightly prefer substantive summaries over title-only stubs.
 */
function substanceBoost(candidate: TrendCandidate): number {
  const len = candidate.summary.trim().length;
  if (len >= 400) return 0.04;
  if (len >= 200) return 0.02;
  return 0;
}

export function filterAndBoostCandidates(
  candidates: TrendCandidate[],
): TrendCandidate[] {
  return candidates
    .filter((c) => !isDiscoveryNoise(c))
    .map((c) => ({
      ...c,
      trendScore: Math.min(1, c.trendScore + substanceBoost(c)),
    }));
}
