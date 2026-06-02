/** HttpOnly cookie marking a signed-in guest session (no DB user). */
export const GUEST_SESSION_COOKIE = "content_os_guest";

/** Signed cookie tracking guest manual discovery usage per UTC day. */
export const GUEST_DISCOVER_COOKIE = "content_os_guest_disc";

/** Guest session lifetime (7 days). */
export const GUEST_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

/** Manual discovery runs allowed per UTC day for guests. */
export const GUEST_DISCOVER_DAILY_LIMIT = 3;

/** sessionStorage key for guest topic board (browser-only). */
export const GUEST_TOPICS_STORAGE_KEY = "content_os_guest_topics";
