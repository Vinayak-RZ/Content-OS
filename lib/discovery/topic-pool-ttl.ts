/** Undrafted topics expire from the visible pool after this many days (unless saved). */
export const TOPIC_POOL_TTL_DAYS = 10;

export const TOPIC_POOL_EXPIRES_MS =
  TOPIC_POOL_TTL_DAYS * 24 * 60 * 60 * 1000;
