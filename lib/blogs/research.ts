import { firecrawlScrapeMarkdown } from "@/lib/discovery/adapters/firecrawl";
import { fetchFirecrawlSearch } from "@/lib/discovery/adapters/firecrawl";
import { canonicalizeUrl } from "@/lib/discovery/urls";
import type { BlogSourceText } from "@/lib/blogs/types";

type TavilyHit = {
  title?: string;
  url?: string;
  content?: string;
};

async function searchTavily(
  apiKey: string,
  query: string,
  maxResults: number,
): Promise<TavilyHit[]> {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: Math.min(maxResults, 8),
        search_depth: "advanced",
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: TavilyHit[]; error?: string };
    if (typeof data.error === "string" && data.error) return [];
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function researchBlogSources(params: {
  title: string;
  seedUrls: string[];
  tavilyApiKey: string | null;
  firecrawlApiKey: string | null;
}): Promise<BlogSourceText[]> {
  const seen = new Set<string>();
  const results: BlogSourceText[] = [];

  function pushSource(source: BlogSourceText): void {
    const key = canonicalizeUrl(source.url);
    if (seen.has(key)) return;
    seen.add(key);
    results.push({ ...source, url: key });
  }

  const title = params.title.trim();
  const queries = title.length > 0 ? [title, `${title} essay blog analysis`] : [];

  if (params.tavilyApiKey && queries.length > 0) {
    for (const query of queries) {
      const hits = await searchTavily(params.tavilyApiKey, query, 4);
      for (const hit of hits) {
        if (!hit.url || !/^https?:\/\//i.test(hit.url)) continue;
        pushSource({
          url: hit.url,
          title: (hit.title ?? "Untitled").slice(0, 200),
          excerpt: (hit.content ?? hit.title ?? "").slice(0, 2000),
          source: "tavily",
        });
        if (results.length >= 8) break;
      }
      if (results.length >= 8) break;
    }
  }

  if (params.firecrawlApiKey && title.length > 0 && results.length < 6) {
    const fc = await fetchFirecrawlSearch(params.firecrawlApiKey, title, 3);
    for (const c of fc.candidates) {
      pushSource({
        url: c.url,
        title: c.title,
        excerpt: c.summary.slice(0, 2000),
        source: "firecrawl",
      });
      if (results.length >= 8) break;
    }
  }

  for (const rawUrl of params.seedUrls) {
    const url = canonicalizeUrl(rawUrl.trim());
    if (!/^https?:\/\//i.test(url)) continue;
    pushSource({
      url,
      title: url,
      excerpt: "",
      source: "manual",
    });
  }

  if (params.firecrawlApiKey) {
    const toScrape = results.filter((r) => r.excerpt.length < 400).slice(0, 5);
    await Promise.all(
      toScrape.map(async (source) => {
        const md = await firecrawlScrapeMarkdown(params.firecrawlApiKey!, source.url);
        if (!md) return;
        const titleMatch = md.match(/^#\s+(.+)$/m);
        if (titleMatch?.[1]?.trim()) {
          source.title = titleMatch[1].trim().slice(0, 200);
        }
        source.excerpt = md.slice(0, 4000);
        source.source = "firecrawl";
      }),
    );
  }

  return results.slice(0, 10);
}
