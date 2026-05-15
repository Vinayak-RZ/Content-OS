import { load } from "cheerio";
import type { AdapterRunResult, TrendCandidate } from "@/lib/discovery/types";
import { canonicalizeUrl } from "@/lib/discovery/urls";

type GhRepo = {
  full_name?: string;
  html_url?: string;
  description?: string | null;
  stargazers_count?: number;
};

type GhSearch = {
  items?: GhRepo[];
};

async function trendingFromSearch(
  budget: number,
  token?: string | null,
): Promise<TrendCandidate[]> {
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const qs = encodeURIComponent(`created:>${weekAgo}`);
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const url = `https://api.github.com/search/repositories?q=${qs}&sort=stars&order=desc&per_page=${Math.min(budget, 15)}`;

  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!res.ok) return [];
  const json = (await res.json()) as GhSearch;
  const items = json.items ?? [];
  const out: TrendCandidate[] = [];
  for (const repo of items) {
    const link = repo.html_url;
    if (!link) continue;
    const stars = repo.stargazers_count ?? 0;
    const name = repo.full_name ?? "repo";
    out.push({
      title: `[GitHub] ${name}`,
      url: canonicalizeUrl(link),
      summary: (repo.description ?? "").slice(0, 500) || `Repository ${name}`,
      source: "GitHub trending (search)",
      sourceType: "github",
      tags: ["github"],
      trendScore: Math.min(stars / 500, 1),
      discoveredAt: new Date(),
      metadata: { stars },
    });
    if (out.length >= budget) break;
  }
  return out;
}

async function trendingFromHtml(budget: number): Promise<TrendCandidate[]> {
  const res = await fetch("https://github.com/trending?since=daily", {
    headers: {
      Accept: "text/html",
      "User-Agent": "ContentOS/1.0",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return [];
  const html = await res.text();
  const $ = load(html);
  const out: TrendCandidate[] = [];
  $("article h2 a").each((_, el) => {
    if (out.length >= budget) return false;
    const href = $(el).attr("href");
    if (!href || !href.startsWith("/")) return;
    const pathPart = href.split("?")[0];
    if (!pathPart || !pathPart.includes("/")) return;
    const url = canonicalizeUrl(`https://github.com${pathPart}`);
    const title = $(el).text().trim().slice(0, 200) || pathPart;
    out.push({
      title: `[GitHub] ${title}`,
      url,
      summary: `Trending repository: ${title}`,
      source: "GitHub trending",
      sourceType: "github",
      tags: ["github"],
      trendScore: 0.65,
      discoveredAt: new Date(),
      metadata: {},
    });
    return undefined;
  });
  return out;
}

export async function fetchGitHubTrending(
  budget: number,
  githubToken?: string | null,
): Promise<AdapterRunResult> {
  if (budget <= 0) {
    return { sourceType: "github", fetched: 0, candidates: [] };
  }

  let candidates = await trendingFromSearch(budget, githubToken);
  if (candidates.length < Math.min(3, budget)) {
    const htmlCand = await trendingFromHtml(budget - candidates.length);
    candidates = [...candidates, ...htmlCand];
  }

  return {
    sourceType: "github",
    fetched: candidates.length,
    candidates: candidates.slice(0, budget),
  };
}
