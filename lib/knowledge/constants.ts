/** Knowledge document roles - drive retrieval buckets and ranking centroids. */
export const KNOWLEDGE_ROLES = [
  "style",
  "narrative",
  "technical",
  "brand",
  "studio",
  "general",
] as const;

export type KnowledgeRole = (typeof KNOWLEDGE_ROLES)[number];

export const MAX_KNOWLEDGE_FILES_PER_USER = 25;
export const MAX_KNOWLEDGE_BYTES = 100 * 1024;

/** Starter templates copied from repo `seeds/starter/` for standalone deploy */
export const KNOWLEDGE_SEED_DIR = ["seeds", "starter"] as const;
export const KNOWLEDGE_TEMPLATE_DIR = ["seeds", "templates"] as const;

export type SystemKnowledgeMeta = {
  slug: string;
  fileName: string;
  displayName: string;
  role: KnowledgeRole;
  sortOrder: number;
  /** Repo path segments after cwd, e.g. ["seeds", "founder", "startup-journey.md"] */
  seedPath?: readonly string[];
};

/** Studio-only documents — highest weight in Studio ideation and drafts. */
export const STUDIO_KNOWLEDGE_FILES: SystemKnowledgeMeta[] = [
  {
    slug: "startup-journey",
    fileName: "startup-journey.md",
    displayName: "Startup journey",
    role: "studio",
    sortOrder: 10,
    seedPath: ["seeds", "founder", "startup-journey.md"],
  },
  {
    slug: "platform-context",
    fileName: "platform-context.md",
    displayName: "Platform context",
    role: "studio",
    sortOrder: 11,
    seedPath: ["seeds", "founder", "platform-context.md"],
  },
  {
    slug: "icp-profile",
    fileName: "icp-profile.md",
    displayName: "ICP profile",
    role: "studio",
    sortOrder: 12,
    seedPath: ["seeds", "templates", "icp-profile.md"],
  },
];

/** @deprecated Use STUDIO_KNOWLEDGE_FILES */
export const STUDIO_OPTIONAL_KNOWLEDGE_FILES = STUDIO_KNOWLEDGE_FILES;

export const FOUNDER_KNOWLEDGE_SEED_DIR = ["seeds", "founder"] as const;

/** Canonical four system documents (bootstrap import). */
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
    slug: "technical-interests",
    fileName: "technical-interests.md",
    displayName: "Interests & expertise",
    role: "technical",
    sortOrder: 2,
  },
  {
    slug: "thoughts",
    fileName: "thoughts.md",
    displayName: "Thoughts",
    role: "technical",
    sortOrder: 3,
  },
];

/** @deprecated Use SYSTEM_KNOWLEDGE_FILES - filenames only for seed loop compatibility */
export const CANONICAL_KNOWLEDGE_FILES = SYSTEM_KNOWLEDGE_FILES.map(
  (f) => f.fileName,
) as readonly string[];

export const ROLE_LABELS: Record<KnowledgeRole, string> = {
  style: "Style",
  narrative: "Narrative",
  technical: "Technical",
  brand: "Brand",
  studio: "Studio",
  general: "General",
};

export const ROLE_DESCRIPTIONS: Record<KnowledgeRole, string> = {
  style:
    "Voice and tone - always included when generating drafts (like writing-style).",
  narrative: "Background and story - used for relevance ranking and topic-matched context.",
  technical:
    "Interests and expertise - ranking alignment and domain context in drafts.",
  brand:
    "Public profile and positioning - topic-matched personal context.",
  studio:
    "Journey, ICP, and personal brand — always prioritized for Studio story ideas and drafts.",
  general: "Anything else - topic-matched context; not used in discovery ranking.",
};
