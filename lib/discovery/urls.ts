import { createHash } from "crypto";

/**
 * Canonical URL for dedup — strip fragments, trivial tracking params, lowercase host.
 */
export function canonicalizeUrl(raw: string): string {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return raw.trim();
  }
  u.hash = "";
  const drop = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "ref",
  ];
  for (const key of drop) {
    u.searchParams.delete(key);
  }
  u.hostname = u.hostname.toLowerCase();
  const path =
    u.pathname.length > 1 && u.pathname.endsWith("/")
      ? u.pathname.slice(0, -1)
      : u.pathname;
  const search = u.searchParams.toString();
  return `${u.protocol}//${u.hostname}${path}${search ? `?${search}` : ""}`;
}

export function urlSha256(canonicalUrl: string): string {
  return createHash("sha256").update(canonicalizeUrl(canonicalUrl), "utf8").digest("hex");
}
