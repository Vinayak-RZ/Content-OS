import {
  KNOWLEDGE_ROLES,
  type KnowledgeRole,
  SYSTEM_KNOWLEDGE_FILES,
} from "@/lib/knowledge/constants";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,48}$/;

export function slugToFileName(slug: string): string {
  return `${slug}.md`;
}

export function fileNameToSlug(fileName: string): string | null {
  const trimmed = fileName.trim().toLowerCase();
  if (!trimmed.endsWith(".md") || trimmed.length < 4) return null;
  const slug = trimmed.slice(0, -3);
  return parseKnowledgeSlug(slug);
}

/**
 * Reject path traversal; allow URL-safe slugs (a-z0-9 and hyphens).
 */
export function parseKnowledgeSlug(raw: string): string | null {
  const trimmed = decodeURIComponent(raw).trim().toLowerCase();
  if (
    trimmed.length === 0 ||
    trimmed.length > 49 ||
    trimmed.includes("..") ||
    trimmed.includes("/") ||
    trimmed.includes("\\") ||
    trimmed.endsWith(".md")
  ) {
    return null;
  }
  if (!SLUG_RE.test(trimmed)) return null;
  return trimmed;
}

/** Accept slug or legacy `name.md` in route params. */
export function parseKnowledgeSlugOrFileName(raw: string): string | null {
  const decoded = decodeURIComponent(raw).trim();
  if (decoded.toLowerCase().endsWith(".md")) {
    return fileNameToSlug(decoded);
  }
  return parseKnowledgeSlug(decoded);
}

export function isKnowledgeRole(value: string): value is KnowledgeRole {
  return (KNOWLEDGE_ROLES as readonly string[]).includes(value);
}

export function getSystemMetaBySlug(slug: string): (typeof SYSTEM_KNOWLEDGE_FILES)[number] | undefined {
  return SYSTEM_KNOWLEDGE_FILES.find((f) => f.slug === slug);
}

export function getSystemMetaByFileName(
  fileName: string,
): (typeof SYSTEM_KNOWLEDGE_FILES)[number] | undefined {
  return SYSTEM_KNOWLEDGE_FILES.find(
    (f) => f.fileName.toLowerCase() === fileName.toLowerCase(),
  );
}
