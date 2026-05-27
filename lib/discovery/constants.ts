/**
 * Broad, high-signal discovery sources.
 * Persona-specific queries live in lib/personas/discovery-queries.ts.
 */

export {
  DEFAULT_FIRECRAWL_QUERIES,
  DEFAULT_TAVILY_QUERIES,
} from "@/lib/personas/discovery-queries";

export const REDDIT_SUBREDDITS: string[] = [
  "MachineLearning",
  "LocalLLaMA",
  "artificial",
  "programming",
  "startups",
  "devops",
  "ExperiencedDevs",
  "insurtech",
  "personalfinance",
  "Entrepreneur",
];

export const DEFAULT_RSS_FEEDS: string[] = [
  "https://news.ycombinator.com/rss",
  "https://github.blog/feed/",
  "https://techcrunch.com/feed/",
  "https://simonwillison.net/atom/everything/",
  "https://www.latent.space/feed",
];
