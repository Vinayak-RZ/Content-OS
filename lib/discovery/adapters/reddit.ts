import { REDDIT_SUBREDDITS } from "@/lib/discovery/constants";
import type { AdapterRunResult, TrendCandidate } from "@/lib/discovery/types";
import { canonicalizeUrl } from "@/lib/discovery/urls";

type RedditChild = {
  data?: {
    title?: string;
    url?: string;
    selftext?: string;
    score?: number;
    permalink?: string;
  };
};

export async function fetchRedditHot(
  budget: number,
): Promise<AdapterRunResult> {
  if (budget <= 0) {
    return { sourceType: "reddit", fetched: 0, candidates: [] };
  }

  const candidates: TrendCandidate[] = [];
  const ua = "ContentOS/1.0 (discovery bot; +https://localhost)";

  for (const sub of REDDIT_SUBREDDITS) {
    if (candidates.length >= budget) break;
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/hot.json?limit=15&raw_json=1`,
        {
          headers: { "User-Agent": ua },
          signal: AbortSignal.timeout(15000),
        },
      );
      if (!res.ok) continue;

      const json = (await res.json()) as { data?: { children?: RedditChild[] } };
      const children = json.data?.children ?? [];
      for (const c of children) {
        if (candidates.length >= budget) break;
        const d = c.data;
        if (!d?.title) continue;
        const rawUrl = d.url && /^https?:\/\//i.test(d.url) ? d.url : "";
        const link =
          rawUrl ||
          (d.permalink
            ? `https://www.reddit.com${d.permalink}`
            : "");
        if (!link) continue;
        const score = typeof d.score === "number" ? d.score : 0;
        const summary = (d.selftext ?? d.title).slice(0, 500);
        candidates.push({
          title: d.title.slice(0, 200),
          url: canonicalizeUrl(link),
          summary,
          source: `r/${sub}`,
          sourceType: "reddit",
          tags: ["reddit", sub],
          trendScore: Math.min(score / 500, 1),
          discoveredAt: new Date(),
          metadata: { subreddit: sub },
        });
      }
    } catch {
      /* skip sub */
    }
  }

  return { sourceType: "reddit", fetched: candidates.length, candidates };
}
