/** Default Tavily queries (IMPLEMENTATION-PLAN §4.3). Rotate / split by fetch budget. */
export const DEFAULT_TAVILY_QUERIES: string[] = [
  "AI infrastructure engineering scalability",
  "LLM inference efficiency developer tools",
  "technical founder startup engineering blog",
  "insurance fraud prevention AI claims",
  "agentic systems developer tooling",
  "distributed systems Rust Go performance",
];

export const REDDIT_SUBREDDITS: string[] = [
  "machinelearning",
  "LocalLLaMA",
  "programming",
  "startups",
  "devops",
  "ExperiencedDevs",
];

/** High-signal tech / founder RSS (no keys). Trim list if feeds fail silently. */
export const DEFAULT_RSS_FEEDS: string[] = [
  "https://news.ycombinator.com/rss",
  "https://github.blog/feed/",
  "https://www.conventionalcommits.org/rss.xml",
  "https://hnrss.org/newest?q=Rust+OR+LLM",
];
