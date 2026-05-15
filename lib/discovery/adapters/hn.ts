import type { TrendCandidate, AdapterRunResult } from "@/lib/discovery/types";
import { canonicalizeUrl } from "@/lib/discovery/urls";

type HnHit = {
  title?: string;
  url?: string;
  points?: number;
};

type HnResponse = {
  hits?: HnHit[];
};

export async function fetchHackerNews(budget: number): Promise<AdapterRunResult> {
  if (budget <= 0) {
    return { sourceType: "hn", fetched: 0, candidates: [] };
  }
  const res = await fetch(
    "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30",
    { signal: AbortSignal.timeout(15000) },
  );
  if (!res.ok) {
    return { sourceType: "hn", fetched: 0, candidates: [] };
  }
  const data = (await res.json()) as HnResponse;
  const hits = data.hits ?? [];
  const take = Math.min(budget, hits.length);
  const candidates: TrendCandidate[] = [];

  for (let i = 0; i < take; i += 1) {
    const h = hits[i];
    if (!h) continue;
    const rawUrl =
      typeof h.url === "string" && h.url.startsWith("http") ? h.url : undefined;
    const storyUrlField = (h as { story_url?: unknown }).story_url;
    const resolvedStory =
      typeof storyUrlField === "string" && storyUrlField.startsWith("http")
        ? storyUrlField
        : "";
    const id = (h as { objectID?: string }).objectID ?? String(i);
    const url =
      rawUrl ||
      resolvedStory ||
      `https://news.ycombinator.com/item?id=${encodeURIComponent(id)}`;
    const title = (h.title ?? "Untitled").slice(0, 200);
    const points = typeof h.points === "number" ? h.points : 0;
    const trendScore = Math.min(points / 1000, 1);
    candidates.push({
      title,
      url: canonicalizeUrl(url),
      summary: title,
      source: "Hacker News",
      sourceType: "hn",
      tags: ["hn", "front-page"],
      trendScore,
      discoveredAt: new Date(),
      metadata: { hnPoints: points },
    });
  }

  return { sourceType: "hn", fetched: candidates.length, candidates };
}
