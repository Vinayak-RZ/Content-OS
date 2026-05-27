/**
 * Discovery quality bar - not a topic whitelist.
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

/** Obvious spam / low-signal - filtered before ranking. */
export const DISCOVERY_NOISE_PATTERNS: readonly RegExp[] = [
  /\bleetcode\b/i,
  /\bcoding interview\b/i,
  /\bhow to prompt chatgpt\b/i,
  /\b100 ai tools\b/i,
  /\bmidjourney prompt\b/i,
  /\bclick here to subscribe\b/i,
];
