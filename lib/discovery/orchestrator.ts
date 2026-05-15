import { randomUUID } from "crypto";

import { prisma } from "@/lib/db";
import { fetchFirecrawlSearch, firecrawlScrapeMarkdown } from "@/lib/discovery/adapters/firecrawl";
import { fetchGitHubTrending } from "@/lib/discovery/adapters/github";
import { fetchHackerNews } from "@/lib/discovery/adapters/hn";
import { fetchRedditHot } from "@/lib/discovery/adapters/reddit";
import { fetchRssFeeds } from "@/lib/discovery/adapters/rss";
import { fetchTavily } from "@/lib/discovery/adapters/tavily";
import {
  computeFetchBudget,
  getSavedTrendsForDiscovery,
} from "@/lib/discovery/carry-over";
import { DEFAULT_TAVILY_QUERIES } from "@/lib/discovery/constants";
import {
  collectExistingTrendUrlHashes,
  collectMemoryExcludedUrlHashes,
  dedupNewCandidates,
} from "@/lib/discovery/dedup";
import type { AdapterRunResult, TrendCandidate } from "@/lib/discovery/types";
import { urlSha256 } from "@/lib/discovery/urls";
import { rankDiscoveryPool } from "@/lib/ranking";
import { getDecryptedKey } from "@/lib/user-settings";

const MAX_NEW_INSERTS = 48;
const ENRICH_MIN_SUMMARY_LEN = 100;
const MAX_ENRICH_PER_RUN = 5;
/** Trend rows expire unless refreshed (~7-day pool). */
const DEFAULT_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

function platformGithubToken(): string | undefined {
  const raw = process.env["GITHUB_TOKEN"];
  const t = typeof raw === "string" ? raw.trim() : "";
  return t || undefined;
}

function mergeCounts(a: AdapterRunResult, map: Record<string, number>): void {
  map[a.sourceType] = (map[a.sourceType] ?? 0) + a.fetched;
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

  const b = Math.max(newFetchBudget, 0);
  const hnTake = Math.min(12, Math.max(5, Math.round(b * 1.8)));
  const rssTake = Math.min(12, Math.max(4, Math.round(b * 1.8)));
  const rdTake = Math.min(16, Math.max(6, Math.round(b * 2)));
  const ghTake = Math.min(10, Math.max(3, Math.round(b * 1.2)));
  const tvTake = tavilyKey
    ? Math.min(28, Math.max(b, Math.round(b * 2)))
    : 0;
  const fcTake =
    firecrawlKey && b > 0 && DEFAULT_TAVILY_QUERIES[0] ? 2 : 0;

  const adapterResults = await Promise.all([
    fetchHackerNews(hnTake),
    fetchRssFeeds(rssTake),
    fetchRedditHot(rdTake),
    fetchGitHubTrending(ghTake, platformGithubToken()),
    tavilyKey
      ? fetchTavily(tavilyKey, tvTake)
      : Promise.resolve({ sourceType: "tavily" as const, fetched: 0, candidates: [] }),
    firecrawlKey && fcTake > 0 && DEFAULT_TAVILY_QUERIES[0]
      ? fetchFirecrawlSearch(
          firecrawlKey,
          DEFAULT_TAVILY_QUERIES[0],
          fcTake,
        )
      : Promise.resolve({
          sourceType: "firecrawl" as const,
          fetched: 0,
          candidates: [],
        }),
  ]);

  let merged: TrendCandidate[] = [];
  for (const r of adapterResults) {
    mergeCounts(r, sourceCounts);
    merged = merged.concat(r.candidates);
  }

  const [existingHashes, memoryHashes] = await Promise.all([
    collectExistingTrendUrlHashes(userId),
    collectMemoryExcludedUrlHashes(userId),
  ]);

  const deduped = dedupNewCandidates(merged, existingHashes, memoryHashes);
  sourceCounts.newFetched = deduped.kept.length;
  sourceCounts.memorySkipped = deduped.memorySkipped;
  sourceCounts.duplicateSkipped = deduped.duplicateSkipped;
  sourceCounts.dismissedSkipped = deduped.duplicateSkipped;

  let enriched: TrendCandidate[] = [...deduped.kept];
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

  const toStore = enriched.slice(0, MAX_NEW_INSERTS);
  const expiresAt = new Date(Date.now() + DEFAULT_EXPIRES_MS);

  const finalScores = await rankDiscoveryPool(userId, saved, toStore);

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

      const offset = saved.length;
      for (let j = 0; j < toStore.length; j += 1) {
        const c = toStore[j];
        if (!c) continue;
        const fs = finalScores[offset + j];
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

  return {
    userId,
    batchId,
    carriedOver: saved.length,
    newStored: toStore.length,
    sourceCounts,
  };
}
