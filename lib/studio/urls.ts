import { urlSha256 } from "@/lib/discovery/urls";

/** Synthetic URL for Studio topics (dedup-safe, no scrape). */
export function studioTopicUrl(userId: string, title: string): string {
  const hash = urlSha256(title.trim().toLowerCase().slice(0, 240));
  return `studio://${userId}/${hash.slice(0, 16)}`;
}

export function isStudioTopicUrl(url: string): boolean {
  return url.startsWith("studio://");
}
