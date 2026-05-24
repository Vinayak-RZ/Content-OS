/** Knowledge document roles — drive retrieval buckets and ranking centroids. */
export const KNOWLEDGE_ROLES = [
  "style",
  "narrative",
  "technical",
  "brand",
  "general",
] as const;

export type KnowledgeRole = (typeof KNOWLEDGE_ROLES)[number];

export const MAX_KNOWLEDGE_FILES_PER_USER = 25;
export const MAX_KNOWLEDGE_BYTES = 100 * 1024;

/** Founder seeds copied from repo `seeds/founder/` for standalone deploy */
export const KNOWLEDGE_SEED_DIR = ["seeds", "founder"] as const;
export const KNOWLEDGE_TEMPLATE_DIR = ["seeds", "templates"] as const;

export type SystemKnowledgeMeta = {
  slug: string;
  fileName: string;
  displayName: string;
  role: KnowledgeRole;
  sortOrder: number;
};

/** Canonical six system documents (bootstrap import). */
export const SYSTEM_KNOWLEDGE_FILES: SystemKnowledgeMeta[] = [
  {
    slug: "writing-style",
    fileName: "writing-style.md",
    displayName: "Writing style",
    role: "style",
    sortOrder: 0,
  },
  {
    slug: "soul",
    fileName: "soul.md",
    displayName: "Soul",
    role: "narrative",
    sortOrder: 1,
  },
  {
    slug: "startup-journey",
    fileName: "startup-journey.md",
    displayName: "Startup journey",
    role: "narrative",
    sortOrder: 2,
  },
  {
    slug: "technical-interests",
    fileName: "technical-interests.md",
    displayName: "Technical interests",
    role: "technical",
    sortOrder: 3,
  },
  {
    slug: "thoughts",
    fileName: "thoughts.md",
    displayName: "Thoughts",
    role: "technical",
    sortOrder: 4,
  },
  {
    slug: "platform-context",
    fileName: "platform-context.md",
    displayName: "Platform context",
    role: "technical",
    sortOrder: 5,
  },
];

/** @deprecated Use SYSTEM_KNOWLEDGE_FILES — filenames only for seed loop compatibility */
export const CANONICAL_KNOWLEDGE_FILES = SYSTEM_KNOWLEDGE_FILES.map(
  (f) => f.fileName,
) as readonly string[];

export const ROLE_LABELS: Record<KnowledgeRole, string> = {
  style: "Style",
  narrative: "Narrative",
  technical: "Technical",
  brand: "Brand",
  general: "General",
};

export const ROLE_DESCRIPTIONS: Record<KnowledgeRole, string> = {
  style:
    "Voice and tone — always included when generating drafts (like writing-style).",
  narrative: "Founder story — used for relevance ranking and topic-matched context.",
  technical:
    "Domains and expertise — ranking alignment and technical context in drafts.",
  brand:
    "LinkedIn, positioning, public profile — topic-matched founder context.",
  general: "Anything else — topic-matched context; not used in discovery ranking.",
};
