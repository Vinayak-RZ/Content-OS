/**
 * Broad, high-signal discovery sources across tech, product, design, finance, and web3.
 * Persona-specific queries live in lib/personas/discovery-queries.ts.
 */

export {
  DEFAULT_FIRECRAWL_QUERIES,
  DEFAULT_TAVILY_QUERIES,
} from "@/lib/personas/discovery-queries";

/** Reddit communities - shuffled per run; not all are developer-focused. */
export const REDDIT_SUBREDDITS: string[] = [
  // Business & product
  "startups",
  "Entrepreneur",
  "ProductManagement",
  "SideProject",
  "business",
  "marketing",
  // Finance
  "investing",
  "stocks",
  "personalfinance",
  "fintech",
  // Design & UX
  "web_design",
  "userexperience",
  "graphic_design",
  // Web3
  "CryptoCurrency",
  "ethereum",
  // General tech & future
  "technology",
  "Futurology",
  "MachineLearning",
];

/** RSS feeds - tech, big tech, product, design, finance, web3. */
export const DEFAULT_RSS_FEEDS: string[] = [
  // News & general tech
  "https://news.ycombinator.com/rss",
  "https://techcrunch.com/feed/",
  "https://www.theverge.com/rss/index.xml",
  "https://www.wired.com/feed/rss",
  "https://www.fastcompany.com/latest/rss",
  // Big companies
  "https://blog.google/rss/",
  "https://blogs.microsoft.com/feed/",
  "https://www.apple.com/newsroom/rss-feed.rss",
  // Product & business
  "https://www.producthunt.com/feed",
  "https://review.firstround.com/feed.xml",
  "https://feeds.hbr.org/harvardbusiness",
  "https://www.entrepreneur.com/latest.rss",
  // Design
  "https://www.smashingmagazine.com/feed/",
  "https://sidebar.io/feed.xml",
  "https://alistapart.com/main/feed/",
  // Finance & markets
  "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
  "https://www.ft.com/?format=rss",
  // Web3
  "https://www.coindesk.com/arc/outboundfeeds/rss/",
  // AI / dev signal (one niche feed)
  "https://simonwillison.net/atom/everything/",
];
