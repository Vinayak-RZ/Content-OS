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
  const feeds = [...DEFAULT_RSS_FEEDS].sort(() => Math.random() - 0.5);
  const maxPerFeed = Math.max(2, Math.ceil(budget / Math.max(feeds.length, 1)));

  for (const feedUrl of feeds) {
    if (candidates.length >= budget) break;
    let takenFromFeed = 0;
    try {
      const feed = await parser.parseURL(feedUrl);
      const titleBase = feed.title ?? "RSS";
      for (const item of feed.items ?? []) {
        if (candidates.length >= budget || takenFromFeed >= maxPerFeed) break;
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
        takenFromFeed += 1;
      }
    } catch {
      /* feed failed */
    }
  }

  return { sourceType: "rss", fetched: candidates.length, candidates };
}
