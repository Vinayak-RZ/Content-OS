import { randomUUID } from "crypto";

import { fetchDiscoveryCandidates } from "@/lib/discovery/fetch-candidates";
import { DISCOVERY_NEW_PER_RUN } from "@/lib/discovery/founder-profile";
import { filterAndBoostCandidates } from "@/lib/discovery/quality";
import { dedupNewCandidates } from "@/lib/discovery/dedup";
import { serializeGuestTrend } from "@/lib/guest/serialize-trend";
import { getDiscoveryQueries } from "@/lib/personas/discovery-queries";
import type { SerializedDashboardTrend } from "@/lib/trends/types";

function platformGithubToken(): string | undefined {
  const raw = process.env["GITHUB_TOKEN"];
  const t = typeof raw === "string" ? raw.trim() : "";
  return t || undefined;
}

export type GuestDiscoveryRunResult = {
  batchId: string;
  newStored: number;
  topics: SerializedDashboardTrend[];
  sourceCounts: Record<string, number>;
};

/**
 * Ephemeral discovery for guests — no Prisma writes; ranks by adapter momentum only.
 */
export async function runDiscoveryForGuest(): Promise<GuestDiscoveryRunResult> {
  const batchId = randomUUID();
  const discoveryQueries = getDiscoveryQueries("founder", null);
  const newFetchBudget = DISCOVERY_NEW_PER_RUN * 4;

  const { candidates: merged, sourceCounts } = await fetchDiscoveryCandidates({
    discoveryQueries,
    githubToken: platformGithubToken(),
    newFetchBudget,
  });

  const deduped = dedupNewCandidates(merged, new Set(), new Set());
  sourceCounts.duplicateSkipped = deduped.duplicateSkipped;
  sourceCounts.memorySkipped = deduped.memorySkipped;

  const enriched = filterAndBoostCandidates([...deduped.kept]);
  const ranked = enriched
    .map((c) => ({ c, score: c.trendScore }))
    .sort((a, b) => b.score - a.score);

  const toStore = ranked.slice(0, DISCOVERY_NEW_PER_RUN);
  const topics: SerializedDashboardTrend[] = toStore.map((row) =>
    serializeGuestTrend(row.c, batchId, row.score),
  );

  sourceCounts.storedNew = topics.length;
  sourceCounts.rankedCandidates = enriched.length;

  return {
    batchId,
    newStored: topics.length,
    topics,
    sourceCounts,
  };
}
