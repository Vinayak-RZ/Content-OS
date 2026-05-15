import Parser from "rss-parser";
import { DEFAULT_RSS_FEEDS } from "@/lib/discovery/constants";
import type { AdapterRunResult, TrendCandidate } from "@/lib/discovery/types";
import { canonicalizeUrl } from "@/lib/discovery/urls";

const parser = new Parser({ timeout: 12000 });

function recencyScore(iso?: string): number {
  if (!iso) return 0.55;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0.55;
  const hours = (Date.now() - t) / 36e5;
  if (hours < 2) return 1;
  if (hours < 24) return 0.85;
  if (hours < 48) return 0.7;
  return 0.55;
}

export async function fetchRssFeeds(
  budget: number,
): Promise<AdapterRunResult> {
  if (budget <= 0) {
    return { sourceType: "rss", fetched: 0, candidates: [] };
  }

  const candidates: TrendCandidate[] = [];

  for (const feedUrl of DEFAULT_RSS_FEEDS) {
    if (candidates.length >= budget) break;
    try {
      const feed = await parser.parseURL(feedUrl);
      const titleBase = feed.title ?? "RSS";
      for (const item of feed.items ?? []) {
        if (candidates.length >= budget) break;
        const link = item.link;
        if (!link || !/^https?:\/\//i.test(link)) continue;
        const title = (item.title ?? "Untitled").slice(0, 200);
        const pub = item.pubDate ?? item.isoDate;
        const summary = (item.contentSnippet ?? item.content ?? title).slice(
          0,
          500,
        );
        candidates.push({
          title,
          url: canonicalizeUrl(link),
          summary,
          source: titleBase.slice(0, 80),
          sourceType: "rss",
          tags: ["rss"],
          trendScore: recencyScore(pub),
          discoveredAt: new Date(),
          metadata: { feedUrl },
        });
      }
    } catch {
      /* feed failed */
    }
  }

  return { sourceType: "rss", fetched: candidates.length, candidates };
}
