/** Exact filenames from IMPLEMENTATION-PLAN §0 (one row per user). */
export const CANONICAL_KNOWLEDGE_FILES = [
  "writing-style.md",
  "soul.md",
  "thoughts.md",
  "technical-interests.md",
  "startup-journey.md",
  "platform-context.md",
] as const;

export type CanonicalKnowledgeFile =
  (typeof CANONICAL_KNOWLEDGE_FILES)[number];

/** Founder seeds copied from repo `MyFiles/` into `seeds/founder/` for standalone deploy */
export const KNOWLEDGE_SEED_DIR = ["seeds", "founder"] as const;

export const MAX_KNOWLEDGE_BYTES = 100 * 1024;
