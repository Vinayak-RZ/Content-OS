/**
 * Discovery quality bar — not a topic whitelist.
 * Personalization comes from Knowledge embeddings + ranking, not hard-coded themes.
 */

/** New topics researched and stored each discovery run (3–4 range; default 4). */
export const DISCOVERY_NEW_PER_RUN = 4;

/** @deprecated Alias for DISCOVERY_NEW_PER_RUN */
export const DISCOVERY_POOL_TARGET = DISCOVERY_NEW_PER_RUN;

/** Max thumbs-up carries (skip re-fetch, stay in pool). */
export const DISCOVERY_MAX_SAVED_CARRY = 3;

/** Dashboard shows this many ranked topics (within visible pool cap). */
export const DASHBOARD_POOL_FETCH_LIMIT = 15;

/** Trim undrafted backlog above this count after each discovery run. */
export const DISCOVERY_VISIBLE_POOL_MAX = 15;

/** Soft minimum pool size guidance for UI copy. */
export const DISCOVERY_VISIBLE_POOL_MIN = 10;

/** Obvious spam / low-signal — filtered before ranking. */
export const DISCOVERY_NOISE_PATTERNS: readonly RegExp[] = [
  /\bleetcode\b/i,
  /\bcoding interview\b/i,
  /\bhow to prompt chatgpt\b/i,
  /\b100 ai tools\b/i,
  /\bmidjourney prompt\b/i,
  /\bclick here to subscribe\b/i,
];

/**
 * Generation guidance only — examples, not allowed topics.
 * You can write about infra, OpenAI, a blog you read, insurance, or anything
 * where you have a genuine take for technical founders.
 */
export const FOUNDER_CONTENT_ANGLE = `Audience: technical founders and senior engineers.

Good post material (examples, not limits):
- A credible news item, paper, or blog you can react to with a clear opinion.
- Infra / systems (e.g. distributed inference, GPUs, agents, evals, observability).
- Model/vendor moves (OpenAI, Anthropic, etc.) when tied to a lesson, not hype.
- Startup building, distribution, product, hiring — when grounded in specifics.
- Industry context (insurance, BFSI, enterprise) when you connect it to a broader point.

Bar: you should be able to add insight, not just summarize. No listicles, no generic hype.
Tone from writing-style.md — analytical, first-person, builder voice.`;
