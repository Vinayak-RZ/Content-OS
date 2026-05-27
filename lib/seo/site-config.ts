/** Canonical public site URL for metadata, sitemap, and JSON-LD. */
export function getSiteUrl(): string {
  const raw =
    process.env["NEXT_PUBLIC_APP_URL"]?.trim() ||
    process.env["NEXTAUTH_URL"]?.trim() ||
    process.env["VERCEL_URL"]?.trim();

  if (!raw) return "http://localhost:3000";
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  return `https://${raw}`.replace(/\/$/, "");
}

export const SITE_NAME = "Content OS";

export const SITE_TAGLINE =
  "Thinking amplification for founders, creators, and builders";

export const SITE_DESCRIPTION =
  "Content OS discovers high-signal topics from Hacker News, Reddit, RSS, and GitHub, ranks them against your knowledge base, and drafts posts in your voice. Free app — bring your own API keys. No auto-posting.";

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
] as const;
