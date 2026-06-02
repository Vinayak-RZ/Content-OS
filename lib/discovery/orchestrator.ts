import { randomUUID } from "crypto";

import { prisma } from "@/lib/db";
import { firecrawlScrapeMarkdown } from "@/lib/discovery/adapters/firecrawl";
import { fetchDiscoveryCandidates } from "@/lib/discovery/fetch-candidates";
import {
  computeFetchBudget,
  getSavedTrendsForDiscovery,
} from "@/lib/discovery/carry-over";
import { getDiscoveryQueries } from "@/lib/personas/discovery-queries";
import { POOL_TARGET } from "@/lib/discovery/carry-over";
import { DISCOVERY_NEW_PER_RUN } from "@/lib/discovery/founder-profile";
import { trimVisibleTopicPool } from "@/lib/discovery/pool-trim";
import { filterAndBoostCandidates } from "@/lib/discovery/quality";
import {
  collectExistingTrendUrlHashes,
  collectMemoryExcludedUrlHashes,
  dedupNewCandidates,
} from "@/lib/discovery/dedup";
import type { TrendCandidate } from "@/lib/discovery/types";
import { urlSha256 } from "@/lib/discovery/urls";
import { rankDiscoveryPool } from "@/lib/ranking";
import { getDecryptedKey } from "@/lib/user-settings";

import { TOPIC_POOL_EXPIRES_MS } from "@/lib/discovery/topic-pool-ttl";

const ENRICH_MIN_SUMMARY_LEN = 100;
const MAX_ENRICH_PER_RUN = 3;

function platformGithubToken(): string | undefined {
  const raw = process.env["GITHUB_TOKEN"];
  const t = typeof raw === "string" ? raw.trim() : "";
  return t || undefined;
}

export type DiscoveryRunResult = {
  userId: string;
  batchId: string;
  carriedOver: number;
  newStored: number;
  sourceCounts: Record<string, number>;
};

/**
 * Carry-over queue + adapter fan-out → memory/URL dedup → optional Firecrawl enrich → rank → persist.
 * `finalScore` comes from `rankDiscoveryPool` (5-signal); falls back to `trendScore` if embeddings fail.
 */
export async function runDiscoveryForUser(
  userId: string,
): Promise<DiscoveryRunResult> {
  const batchId = randomUUID();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const tavilyKey = getDecryptedKey(user, "tavilyApiKey");
  const firecrawlKey = getDecryptedKey(user, "firecrawlApiKey");
  const discoveryQueries = getDiscoveryQueries(
    user.personaType,
    user.personaCustom,
  );

  const saved = await getSavedTrendsForDiscovery(userId);
  const { newFetchBudget } = computeFetchBudget(saved.length);

  const sourceCounts: Record<string, number> = {
    carriedOver: saved.length,
    hn: 0,
    rss: 0,
    reddit: 0,
    github: 0,
    tavily: 0,
    firecrawl: 0,
    newFetched: 0,
    duplicateSkipped: 0,
    memorySkipped: 0,
  };

  const { candidates: merged, sourceCounts: fetchCounts } =
    await fetchDiscoveryCandidates({
      discoveryQueries,
      tavilyKey: tavilyKey ?? undefined,
      firecrawlKey: firecrawlKey ?? undefined,
      githubToken: platformGithubToken(),
      newFetchBudget,
    });
  Object.assign(sourceCounts, fetchCounts);

  const [existingHashes, memoryHashes] = await Promise.all([
    collectExistingTrendUrlHashes(userId),
    collectMemoryExcludedUrlHashes(userId),
  ]);

  const deduped = dedupNewCandidates(merged, existingHashes, memoryHashes);
  sourceCounts.newFetched = deduped.kept.length;
  sourceCounts.memorySkipped = deduped.memorySkipped;
  sourceCounts.duplicateSkipped = deduped.duplicateSkipped;
  sourceCounts.dismissedSkipped = deduped.duplicateSkipped;

  let enriched: TrendCandidate[] = filterAndBoostCandidates([...deduped.kept]);
  let enrichCalls = MAX_ENRICH_PER_RUN;

  if (firecrawlKey && enrichCalls > 0) {
    const next: TrendCandidate[] = [...enriched];
    for (let i = 0; i < next.length && enrichCalls > 0; i += 1) {
      const row = next[i];
      if (!row) continue;
      if (row.summary.trim().length >= ENRICH_MIN_SUMMARY_LEN) continue;

      enrichCalls -= 1;
      const md = await firecrawlScrapeMarkdown(firecrawlKey, row.url);
      if (md && md.trim().length > ENRICH_MIN_SUMMARY_LEN) {
        const updated: TrendCandidate = {
          title: row.title,
          url: row.url,
          summary: md.trim().slice(0, 1500),
          source: row.source,
          sourceType: row.sourceType,
          tags: row.tags,
          trendScore: row.trendScore,
          discoveredAt: row.discoveredAt,
          metadata: { ...row.metadata, enrichedByFirecrawl: true },
        };
        next[i] = updated;
      }
    }
    enriched = next;
  }

  const expiresAt = new Date(Date.now() + TOPIC_POOL_EXPIRES_MS);

  const finalScores = await rankDiscoveryPool(userId, saved, enriched);

  const newScoreSlice = finalScores.slice(saved.length);
  const rankedNew = enriched
    .map((c, i) => ({
      c,
      score:
        typeof newScoreSlice[i] === "number"
          ? newScoreSlice[i]!
          : c.trendScore,
    }))
    .sort((a, b) => b.score - a.score);

  const newSlots = DISCOVERY_NEW_PER_RUN;
  const toStore = rankedNew.slice(0, newSlots).map((r) => r.c);

  await prisma.$transaction(
    async (tx) => {
      for (let i = 0; i < saved.length; i += 1) {
        const s = saved[i];
        const fs = finalScores[i];
        if (!s) continue;
        await tx.trend.update({
          where: { id: s.id },
          data: {
            discoveryBatchId: batchId,
            expiresAt,
            finalScore: typeof fs === "number" ? fs : s.trendScore,
          },
        });
      }

      for (let j = 0; j < rankedNew.length && j < newSlots; j += 1) {
        const row = rankedNew[j];
        if (!row) continue;
        const c = row.c;
        const fs = row.score;
        await tx.trend.create({
          data: {
            userId,
            title: c.title.slice(0, 240),
            source: c.source.slice(0, 120),
            url: c.url,
            urlHash: urlSha256(c.url),
            summary: c.summary.slice(0, 2400),
            trendScore: c.trendScore,
            finalScore: typeof fs === "number" ? fs : c.trendScore,
            tags: c.tags.slice(0, 20),
            sourceType: c.sourceType,
            discoveredAt: c.discoveredAt,
            expiresAt,
            discoveryBatchId: batchId,
          },
        });
      }
    },
    {
      maxWait: 15_000,
      timeout: 120_000,
    },
  );

  sourceCounts.poolTarget = POOL_TARGET;
  sourceCounts.newPerRun = DISCOVERY_NEW_PER_RUN;
  sourceCounts.rankedCandidates = enriched.length;
  sourceCounts.storedNew = toStore.length;

  const trimmed = await trimVisibleTopicPool(userId);
  sourceCounts.poolTrimmed = trimmed;

  return {
    userId,
    batchId,
    carriedOver: saved.length,
    newStored: toStore.length,
    sourceCounts,
  };
}
