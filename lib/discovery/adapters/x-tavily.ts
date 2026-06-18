import type { AdapterRunResult, TrendCandidate } from "@/lib/discovery/types";
import { canonicalizeUrl } from "@/lib/discovery/urls";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  published_date?: string;
};

type TavilyResponse = {
  results?: TavilyResult[];
  error?: string;
};

function isXUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return host === "x.com" || host === "twitter.com" || host.endsWith(".x.com");
  } catch {
    return false;
  }
}

function pickQueriesForRun(queries: string[]): string[] {
  const pool = [...queries];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  const count = Math.min(4, pool.length);
  return pool.slice(0, count);
}

/** Discover viral X posts via Tavily search (BYOK). */
export async function fetchXTavily(
  apiKey: string,
  budget: number,
  queryPool: string[],
): Promise<AdapterRunResult> {
  if (budget <= 0 || !apiKey || queryPool.length === 0) {
    return { sourceType: "x", fetched: 0, candidates: [] };
  }

  const queries = pickQueriesForRun(queryPool);
  const perQuery = Math.max(2, Math.ceil(budget / queries.length));
  const all: TrendCandidate[] = [];

  for (const query of queries) {
    if (all.length >= budget) break;
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          max_results: Math.min(perQuery, budget - all.length),
          search_depth: "advanced",
        }),
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) continue;

      const data = (await res.json()) as TavilyResponse;
      if (typeof data.error === "string" && data.error) continue;

      for (const r of data.results ?? []) {
        if (all.length >= budget) break;
        const url = r.url;
        if (!url || !/^https?:\/\//i.test(url) || !isXUrl(url)) continue;

        const title = (r.title ?? "X post").slice(0, 200);
        const summary = (
          typeof r.content === "string" && r.content.trim().length > 0
            ? r.content
            : r.published_date
              ? `X post · ${r.published_date}`
              : title
        ).slice(0, 500);

        all.push({
          title,
          url: canonicalizeUrl(url),
          summary,
          source: "X",
          sourceType: "x",
          tags: ["x", "twitter"],
          trendScore: 0.78,
          discoveredAt: new Date(),
          metadata: { tavilyQuery: query.slice(0, 120), xViaTavily: true },
        });
      }
    } catch {
      /* skip query */
    }
  }

  return { sourceType: "x", fetched: all.length, candidates: all };
}
