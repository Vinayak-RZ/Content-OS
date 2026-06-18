import { getDiscoveryQueries } from "@/lib/personas/discovery-queries";
import { resolvePersonaLabel } from "@/lib/personas/types";
import type { LinkedInResearchResult } from "@/lib/improvement/types";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
};

type TavilyResponse = {
  results?: TavilyResult[];
  error?: string;
};

const LINKEDIN_QUERIES = [
  "what content formats are working on LinkedIn 2026",
  "LinkedIn post engagement trends founders",
  "best performing LinkedIn content types",
];

async function searchTavily(
  apiKey: string,
  query: string,
  maxResults: number,
): Promise<TavilyResult[]> {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: maxResults,
        search_depth: "advanced",
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as TavilyResponse;
    if (typeof data.error === "string" && data.error) return [];
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function researchLinkedInTrends(params: {
  tavilyApiKey: string | null;
  personaType: string | null;
  personaCustom: string | null;
}): Promise<LinkedInResearchResult> {
  const { tavilyApiKey, personaType, personaCustom } = params;

  if (!tavilyApiKey) {
    return {
      sources: [],
      synthesis:
        "Connect a Tavily API key in Settings to enable LinkedIn trend research.",
    };
  }

  const persona = resolvePersonaLabel(personaType, personaCustom);
  const personaQueries = getDiscoveryQueries(personaType, personaCustom);
  const queries = [
    `LinkedIn content that works for ${persona} 2026`,
    ...LINKEDIN_QUERIES.slice(0, 2),
    ...personaQueries.tavily.slice(0, 1).map((q) => `${q} LinkedIn`),
  ].slice(0, 4);

  const seen = new Set<string>();
  const sources: LinkedInResearchResult["sources"] = [];

  for (const query of queries) {
    const results = await searchTavily(tavilyApiKey, query, 3);
    for (const r of results) {
      const url = r.url ?? "";
      if (!url || seen.has(url)) continue;
      seen.add(url);
      sources.push({
        title: (r.title ?? "Untitled").slice(0, 200),
        snippet: (typeof r.content === "string" ? r.content : r.title ?? "").slice(
          0,
          300,
        ),
        url,
      });
      if (sources.length >= 8) break;
    }
    if (sources.length >= 8) break;
  }

  const synthesis =
    sources.length > 0
      ? `Found ${sources.length} sources on LinkedIn content trends for ${persona}. Key themes: personal stories, specific lessons, and opinion-led posts tend to outperform generic advice. See individual sources for details.`
      : "No LinkedIn trend sources found. Try again later or check your Tavily API key.";

  return { sources, synthesis };
}
