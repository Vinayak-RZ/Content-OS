import { DEFAULT_TAVILY_QUERIES } from "@/lib/discovery/constants";
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

/** Rotate queries each run so discovery is not locked to one theme. */
function pickQueriesForRun(): string[] {
  const pool = [...DEFAULT_TAVILY_QUERIES];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  const count = Math.min(5, pool.length);
  return pool.slice(0, count);
}

export async function fetchTavily(
  apiKey: string,
  budget: number,
): Promise<AdapterRunResult> {
  if (budget <= 0 || !apiKey) {
    return { sourceType: "tavily", fetched: 0, candidates: [] };
  }

  const queries = pickQueriesForRun();
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
      const rows = data.results ?? [];
      for (const r of rows) {
        if (all.length >= budget) break;
        const url = r.url;
        const title = (r.title ?? "Untitled").slice(0, 200);
        if (!url || !/^https?:\/\//i.test(url)) continue;
        const summary = (
          typeof r.content === "string"
            ? r.content
            : r.published_date
              ? `Published ${r.published_date}`
              : title
        ).slice(0, 500);
        all.push({
          title,
          url: canonicalizeUrl(url),
          summary,
          source: `Tavily`,
          sourceType: "tavily",
          tags: ["tavily"],
          trendScore: 0.72,
          discoveredAt: new Date(),
          metadata: { tavilyQuery: query.slice(0, 120) },
        });
      }
    } catch {
      /* skip query */
    }
  }

  return { sourceType: "tavily", fetched: all.length, candidates: all };
}
