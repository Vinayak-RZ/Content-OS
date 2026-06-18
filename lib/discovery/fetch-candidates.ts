import { fetchFirecrawlSearch } from "@/lib/discovery/adapters/firecrawl";
import { fetchGitHubTrending } from "@/lib/discovery/adapters/github";
import { fetchHackerNews } from "@/lib/discovery/adapters/hn";
import { fetchRedditHot } from "@/lib/discovery/adapters/reddit";
import { fetchRssFeeds } from "@/lib/discovery/adapters/rss";
import { fetchTavily } from "@/lib/discovery/adapters/tavily";
import { fetchXTavily } from "@/lib/discovery/adapters/x-tavily";
import type { AdapterRunResult, TrendCandidate } from "@/lib/discovery/types";

export type DiscoveryQuerySet = {
  tavily: string[];
  firecrawl: string[];
  x: string[];
};

function mergeCounts(a: AdapterRunResult, map: Record<string, number>): void {
  map[a.sourceType] = (map[a.sourceType] ?? 0) + a.fetched;
}

export type FetchDiscoveryCandidatesOptions = {
  discoveryQueries: DiscoveryQuerySet;
  tavilyKey?: string;
  firecrawlKey?: string;
  githubToken?: string;
  /** Adapter pull budget for new topics (0 still fetches a minimal baseline). */
  newFetchBudget: number;
};

/**
 * Fan-out to discovery adapters and merge normalized candidates (no DB).
 */
export async function fetchDiscoveryCandidates(
  opts: FetchDiscoveryCandidatesOptions,
): Promise<{
  candidates: TrendCandidate[];
  sourceCounts: Record<string, number>;
}> {
  const sourceCounts: Record<string, number> = {
    hn: 0,
    rss: 0,
    reddit: 0,
    github: 0,
    tavily: 0,
    firecrawl: 0,
    x: 0,
    newFetched: 0,
  };

  const b = Math.max(opts.newFetchBudget, 0);
  const noTavily = !opts.tavilyKey;
  const hnTake = Math.min(noTavily ? 6 : 8, Math.max(3, b + (noTavily ? 2 : 3)));
  const rssTake = Math.min(
    noTavily ? 20 : 14,
    Math.max(noTavily ? 12 : 6, b + (noTavily ? 10 : 5)),
  );
  const rdTake = Math.min(
    noTavily ? 20 : 14,
    Math.max(noTavily ? 12 : 6, b + (noTavily ? 10 : 5)),
  );
  const ghTake = Math.min(noTavily ? 3 : 5, Math.max(1, b + (noTavily ? 0 : 1)));
  const tvTake = opts.tavilyKey ? Math.min(16, Math.max(8, b * 3)) : 0;
  const fcTake =
    opts.firecrawlKey && b > 0 && opts.discoveryQueries.firecrawl[0] ? 2 : 0;

  const xTake = opts.tavilyKey ? Math.min(8, Math.max(4, Math.floor(b * 1.5))) : 0;

  const adapterResults = await Promise.all([
    fetchHackerNews(hnTake),
    fetchRssFeeds(rssTake),
    fetchRedditHot(rdTake),
    fetchGitHubTrending(ghTake, opts.githubToken),
    opts.tavilyKey
      ? fetchTavily(opts.tavilyKey, tvTake, opts.discoveryQueries.tavily)
      : Promise.resolve({ sourceType: "tavily" as const, fetched: 0, candidates: [] }),
    opts.tavilyKey
      ? fetchXTavily(opts.tavilyKey, xTake, opts.discoveryQueries.x)
      : Promise.resolve({ sourceType: "x" as const, fetched: 0, candidates: [] }),
    opts.firecrawlKey && fcTake > 0 && opts.discoveryQueries.firecrawl[0]
      ? fetchFirecrawlSearch(
          opts.firecrawlKey,
          opts.discoveryQueries.firecrawl[0]!,
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

  sourceCounts.newFetched = merged.length;
  return { candidates: merged, sourceCounts };
}
