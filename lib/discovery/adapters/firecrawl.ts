import type { AdapterRunResult, TrendCandidate } from "@/lib/discovery/types";
import { canonicalizeUrl } from "@/lib/discovery/urls";

type FirecrawlHit = { url?: string; title?: string; description?: string };

function asObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/** Normalise API variants: `data.web[]`, `data[]`, or flat `web[]`. */
function extractSearchHits(json: unknown): FirecrawlHit[] {
  const root = asObject(json);
  if (!root) return [];

  const directWeb = root["web"];
  if (Array.isArray(directWeb)) {
    return directWeb.filter((x) => x && typeof x === "object") as FirecrawlHit[];
  }

  const data = root["data"];
  if (Array.isArray(data)) {
    return data.filter((x) => x && typeof x === "object") as FirecrawlHit[];
  }

  const dataObj = asObject(data);
  if (dataObj) {
    const web = dataObj["web"];
    if (Array.isArray(web)) {
      return web.filter((x) => x && typeof x === "object") as FirecrawlHit[];
    }
    const results = dataObj["results"];
    if (Array.isArray(results)) {
      return results.filter((x) => x && typeof x === "object") as FirecrawlHit[];
    }
  }

  return [];
}

/** Firecrawl search - max ~2 hits per discovery run per plan §4.3 */
export async function fetchFirecrawlSearch(
  apiKey: string,
  query: string,
  limit: number,
): Promise<AdapterRunResult> {
  if (!apiKey || limit <= 0) {
    return { sourceType: "firecrawl", fetched: 0, candidates: [] };
  }

  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: Math.min(limit, 5),
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      return { sourceType: "firecrawl", fetched: 0, candidates: [] };
    }
    const json: unknown = await res.json();
    const web = extractSearchHits(json);
    const candidates: TrendCandidate[] = [];
    for (const r of web) {
      if (!r.url || !/^https?:\/\//i.test(r.url)) continue;
      candidates.push({
        title: (r.title ?? "Untitled").slice(0, 200),
        url: canonicalizeUrl(r.url),
        summary: (r.description ?? r.title ?? "").slice(0, 500),
        source: "Firecrawl search",
        sourceType: "firecrawl",
        tags: ["firecrawl"],
        trendScore: 0.68,
        discoveredAt: new Date(),
        metadata: { firecrawlQuery: query.slice(0, 120) },
      });
    }
    return {
      sourceType: "firecrawl",
      fetched: candidates.length,
      candidates,
    };
  } catch {
    return { sourceType: "firecrawl", fetched: 0, candidates: [] };
  }
}

export async function firecrawlScrapeMarkdown(
  apiKey: string,
  pageUrl: string,
): Promise<string | null> {
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: pageUrl,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { markdown?: string };
    };
    const md = json.data?.markdown;
    return typeof md === "string" && md.length > 0 ? md.slice(0, 8000) : null;
  } catch {
    return null;
  }
}
