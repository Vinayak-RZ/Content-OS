import { GITHUB_REPO_URL } from "@/lib/github-links";

/** Production canonical origin (non-www). Used when env URLs are missing or misconfigured. */
export const CANONICAL_SITE_ORIGIN = "https://content-os.stamped.work";

/** Normalize to HTTPS apex host — prevents duplicate www / non-www in sitemap & JSON-LD. */
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
export const SITE_SAME_AS = [GITHUB_REPO_URL] as const;

export const SITE_NAME = "Content OS";

export const SITE_TAGLINE =
  "Thinking amplification for founders, creators, and builders";

export const SITE_DESCRIPTION =
  "Content OS discovers high-signal topics from Hacker News, Instagram, Reddit, RSS, and GitHub, ranks them against your knowledge base, and drafts posts in your voice. Free app — bring your own API keys. No auto-posting.";

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
] as const;
