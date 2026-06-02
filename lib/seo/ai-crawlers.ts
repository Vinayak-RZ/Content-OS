/** Known AI / LLM crawlers - explicitly allowed on public pages. */
export const AI_CRAWLER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "cohere-ai",
  "CCBot",
  "Diffbot",
  "FacebookBot",
  "meta-externalagent",
  "Amazonbot",
  "YouBot",
  "Bytespider",
] as const;

/** Paths safe for bots and AI agents to read (no auth required). */
export const PUBLIC_CRAWL_PATHS = [
  "/",
  "/login",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap.xml",
  "/robots.txt",
  "/brand/",
] as const;

/** Authenticated or sensitive routes - crawl discouraged. */
export const PRIVATE_CRAWL_PATHS = [
  "/dashboard",
  "/draft/",
  "/drafts",
  "/knowledge",
  "/settings",
  "/analytics",
  "/activity",
  "/onboarding",
  "/api/",
] as const;
