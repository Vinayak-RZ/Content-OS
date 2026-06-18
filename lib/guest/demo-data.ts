import type { AnalyticsSummary } from "@/lib/analytics/summary";
import type { SettingsResponse } from "@/lib/user-settings";
import type { ClientDraftPayload } from "@/lib/drafts/serialize-for-client";

export const GUEST_DEMO_DRAFT_IDS = {
  primary: "00000000-0000-4000-8000-000000000001",
  second: "00000000-0000-4000-8000-000000000002",
  third: "00000000-0000-4000-8000-000000000003",
} as const;

export type GuestDemoDraftRow = {
  id: string;
  topicTitle: string;
  status: string;
  updatedAt: string;
  currentContent: string;
};

export const GUEST_DEMO_DRAFTS: GuestDemoDraftRow[] = [
  {
    id: GUEST_DEMO_DRAFT_IDS.primary,
    topicTitle: "Why founders should own distribution, not just product",
    status: "draft",
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    currentContent:
      "Most teams ship features and hope distribution follows. The uncomfortable truth: attention is a system, not a launch-day surprise…",
  },
  {
    id: GUEST_DEMO_DRAFT_IDS.second,
    topicTitle: "Open-source LLM tooling is commoditizing - what still matters",
    status: "ready",
    updatedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    currentContent:
      "When every repo ships a RAG template, differentiation moves to taste, distribution, and workflow…",
  },
  {
    id: GUEST_DEMO_DRAFT_IDS.third,
    topicTitle: "Published: Building in public without performative hustle",
    status: "published",
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    currentContent:
      "I used to post updates because I thought consistency meant visibility. What changed was writing only when I had a real lesson…",
  },
];

const DEMO_DRAFT_WORKSPACES: Record<string, ClientDraftPayload> = {
  [GUEST_DEMO_DRAFT_IDS.primary]: {
    id: GUEST_DEMO_DRAFT_IDS.primary,
    topicTitle: GUEST_DEMO_DRAFTS[0]!.topicTitle,
    currentContent: `Most teams ship features and hope distribution follows.

The uncomfortable truth: attention is a system, not a launch-day surprise.

Here's what we changed:
→ One narrative per week, not ten threads
→ Discovery tied to knowledge, not vibes
→ Drafts reviewed before anything goes live

If you're pre-PMF, bias toward channels you can repeat - not viral one-offs.`,
    hookVariants: [
      "Distribution is a product surface. Treat it like one.",
      "Your roadmap is not your GTM.",
    ],
    ctaVariants: [
      "What's the one channel you're doubling down on this quarter?",
      "Reply with the workflow you use to stay consistent.",
    ],
    selectedHook: 0,
    selectedCta: 0,
    xThreadParts: [],
    revisions: [],
    status: "draft",
    sources: ["https://example.com/founder-distribution"],
    trend: {
      url: "https://news.ycombinator.com/",
      title: "HN · Founder distribution essay",
    },
  },
  [GUEST_DEMO_DRAFT_IDS.second]: {
    id: GUEST_DEMO_DRAFT_IDS.second,
    topicTitle: GUEST_DEMO_DRAFTS[1]!.topicTitle,
    currentContent: GUEST_DEMO_DRAFTS[1]!.currentContent,
    hookVariants: ["The moat moved upstream."],
    ctaVariants: ["Agree or disagree?"],
    selectedHook: 0,
    selectedCta: 0,
    xThreadParts: [],
    revisions: [],
    status: "ready",
    sources: [],
    trend: null,
  },
  [GUEST_DEMO_DRAFT_IDS.third]: {
    id: GUEST_DEMO_DRAFT_IDS.third,
    topicTitle: GUEST_DEMO_DRAFTS[2]!.topicTitle,
    currentContent: GUEST_DEMO_DRAFTS[2]!.currentContent,
    hookVariants: ["Building in public without the performance."],
    ctaVariants: ["Follow for quieter founder notes."],
    selectedHook: 0,
    selectedCta: 0,
    xThreadParts: [],
    revisions: [],
    status: "published",
    sources: ["https://example.com/build-in-public"],
    trend: {
      url: "https://example.com/build-in-public",
      title: "Building in public",
    },
  },
};

export function getGuestDemoDraft(id: string): ClientDraftPayload | null {
  return DEMO_DRAFT_WORKSPACES[id] ?? DEMO_DRAFT_WORKSPACES[GUEST_DEMO_DRAFT_IDS.primary] ?? null;
}

export type GuestDemoKnowledgeFile = {
  slug: string;
  fileName: string;
  displayName: string;
  role: string;
  sortOrder: number;
  isSystem: boolean;
  updatedAt: string;
  fileVersion: number;
  chunkCount: number;
};

export const GUEST_DEMO_KNOWLEDGE_FILES: GuestDemoKnowledgeFile[] = [
  {
    slug: "writing-style",
    fileName: "writing-style.md",
    displayName: "Writing style",
    role: "style",
    sortOrder: 0,
    isSystem: true,
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    fileVersion: 1,
    chunkCount: 12,
  },
  {
    slug: "soul",
    fileName: "soul.md",
    displayName: "Soul",
    role: "narrative",
    sortOrder: 1,
    isSystem: true,
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    fileVersion: 1,
    chunkCount: 18,
  },
  {
    slug: "technical-interests",
    fileName: "technical-interests.md",
    displayName: "Interests & expertise",
    role: "technical",
    sortOrder: 2,
    isSystem: true,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    fileVersion: 1,
    chunkCount: 9,
  },
  {
    slug: "thoughts",
    fileName: "thoughts.md",
    displayName: "Thoughts",
    role: "technical",
    sortOrder: 3,
    isSystem: true,
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    fileVersion: 1,
    chunkCount: 6,
  },
  {
    slug: "linkedin-positioning",
    fileName: "linkedin-positioning.md",
    displayName: "LinkedIn positioning",
    role: "brand",
    sortOrder: 4,
    isSystem: false,
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    fileVersion: 2,
    chunkCount: 4,
  },
];

/** Static markdown shown in Knowledge preview (no API calls). */
export const GUEST_DEMO_KNOWLEDGE_CONTENT: Record<string, string> = {
  "writing-style": `# Writing style

Direct, founder-friendly voice. Short paragraphs. No hype adjectives.

## Core voice
- Clear thesis in the first two lines
- Concrete examples over abstractions
- Light humor, never sarcasm at the reader

## LinkedIn
Hooks under 120 characters. One idea per paragraph. End with a question or soft CTA.`,
  soul: `# Soul

Builder-founder writing in public about distribution, AI workflows, and calm execution.

## What drives them
Ship useful tools, explain trade-offs honestly, help peers avoid performative hustle.

## Personality
Curious, slightly contrarian, generous with specifics - not motivational poster energy.`,
  "technical-interests": `# Interests & expertise

- LLM apps, RAG, and evaluation
- Next.js product engineering
- Founder GTM and content systems
- Open-source dev tools

Used for discovery ranking alignment and technical draft context.`,
  thoughts: `# Thoughts

Scratchpad for half-formed ideas, reactions to news, and quotes worth revisiting.

> "Distribution is a system you design, not a lottery you win."

Keeps ranking fresh without polluting polished narrative docs.`,
  "linkedin-positioning": `# LinkedIn positioning

Headline: Building Content OS - discovery → drafts in your voice.

About: I write about founder distribution, thoughtful AI workflows, and shipping without auto-posting.

Pinned themes: building in public, systems thinking, practical essays.`,
};

export function getGuestDemoKnowledgeContent(slug: string): string {
  return (
    GUEST_DEMO_KNOWLEDGE_CONTENT[slug] ??
    `# ${slug}\n\nSign in to load and edit your real knowledge files.`
  );
}

export const GUEST_DEMO_SETTINGS: SettingsResponse = {
  email: "you@example.com",
  displayName: "Preview workspace",
  timezone: "Asia/Kolkata",
  emailDigest: true,
  onboardingCompleted: true,
  personaType: "founder",
  personaCustom: null,
  keys: {
    tavily: false,
    firecrawl: false,
    openrouter: true,
    nvidia: false,
    openai: false,
    buffer: false,
  },
  bufferOrganizationId: null,
  bufferLastSyncAt: null,
  bufferLastSyncError: null,
  draftProvider: "openrouter",
  draftModelId: "anthropic/claude-sonnet-4",
  activeDraftProvider: "openrouter",
  activeModelId: "anthropic/claude-sonnet-4",
  activeModelDisplayName: "Claude Sonnet",
};

function last14DayCounts(): { date: string; count: number }[] {
  const out: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({
      date: d.toISOString().slice(0, 10),
      count: i % 3 === 0 ? 2 : i % 2 === 0 ? 1 : 0,
    });
  }
  return out;
}

export const GUEST_DEMO_ANALYTICS: AnalyticsSummary = {
  publishedCount: 12,
  discoveryRunsTotal: 28,
  discoveryRunsToday: 1,
  publishedThisWeek: 4,
  publishedByDay: last14DayCounts(),
  recentPublished: [
    {
      id: GUEST_DEMO_DRAFT_IDS.third,
      topicTitle: GUEST_DEMO_DRAFTS[2]!.topicTitle,
      updatedAt: GUEST_DEMO_DRAFTS[2]!.updatedAt,
    },
    {
      id: GUEST_DEMO_DRAFT_IDS.second,
      topicTitle: "RAG chunking strategies that actually help drafts",
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};
