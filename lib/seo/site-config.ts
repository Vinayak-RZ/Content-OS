import { buildSiteSameAs } from "@/lib/seo/social-links";

/** Production canonical origin (non-www). Used when env URLs are missing or misconfigured. */
export const CANONICAL_SITE_ORIGIN = "https://content-os.stamped.work";

/** Normalize to HTTPS apex host - prevents duplicate www / non-www in sitemap & JSON-LD. */
export function normalizeSiteOrigin(raw: string): string {
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  const url = new URL(withProtocol);
  if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.slice(4);
  }
  return url.origin;
}

/** Canonical public site URL for metadata, sitemap, and JSON-LD. */
export function getSiteUrl(): string {
  const raw =
    process.env["NEXT_PUBLIC_APP_URL"]?.trim() ||
    process.env["NEXTAUTH_URL"]?.trim() ||
    process.env["VERCEL_URL"]?.trim();

  if (!raw) {
    return process.env.NODE_ENV === "production"
      ? CANONICAL_SITE_ORIGIN
      : "http://localhost:3000";
  }

  return normalizeSiteOrigin(raw);
}

/** Organization / sameAs profiles for EEAT structured data. */
export const SITE_SAME_AS = buildSiteSameAs();

export const SITE_NAME = "Content OS";

export const SITE_TAGLINE =
  "Thinking amplification for founders, creators, and builders";

/** Full product summary for JSON-LD, llms files, and Open Graph body copy. */
export const SITE_DESCRIPTION =
  "Content OS discovers high-signal topics from Hacker News, Instagram, Reddit, RSS, and GitHub, ranks them against your knowledge base, and drafts posts in your voice. Try as a guest or sign in free — bring your own API keys. No auto-posting.";

/** SERP meta description (~155 chars; Google truncates longer snippets). */
export const SITE_META_DESCRIPTION =
  "Free AI content workflow for founders: topic discovery from HN, Reddit, RSS & more, knowledge-base ranking, drafts in your voice. Guest trial · BYOK · no auto-posting.";

export const SITE_KEYWORDS = [
  "content creation",
  "topic discovery",
  "AI writing assistant",
  "founder content",
  "build in public",
  "LinkedIn drafts",
  "Twitter drafts",
  "knowledge base",
  "content workflow",
  "Hacker News topics",
  "Instagram trends",
  "personal brand",
  "signal over noise",
  "content operating system",
  "try without signup",
  "guest mode",
  "free content workflow",
] as const;
