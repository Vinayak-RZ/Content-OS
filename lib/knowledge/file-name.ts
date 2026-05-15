import { CANONICAL_KNOWLEDGE_FILES } from "@/lib/knowledge/constants";

/**
 * Reject path traversal; only canonical founder filenames (exact casing in array).
 */
export function parseKnowledgeFileName(raw: string): string | null {
  const trimmed = decodeURIComponent(raw).trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > 160 ||
    trimmed.includes("..") ||
    trimmed.includes("/") ||
    trimmed.includes("\\")
  ) {
    return null;
  }
  const lower = trimmed.toLowerCase();
  if (!(CANONICAL_KNOWLEDGE_FILES as readonly string[]).includes(lower)) {
    return null;
  }
  const matched = CANONICAL_KNOWLEDGE_FILES.find(
    (n) => n.toLowerCase() === lower,
  );
  return matched ?? null;
}

export function isAllowedKnowledgeFile(name: string): boolean {
  return parseKnowledgeFileName(name) !== null;
}
