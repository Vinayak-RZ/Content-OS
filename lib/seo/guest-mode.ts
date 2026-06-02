/** Shared SEO/AEO copy for guest preview mode (public pages only). */

export const GUEST_MODE_SHORT =
  "Try the app as a guest with no account, or sign in with Google to save your work.";

export const GUEST_MODE_LOGIN_DESCRIPTION =
  "Sign in with Google to save topics, knowledge, and drafts — or use guest mode to preview the app with no account.";

export const GUEST_MODE_FAQ_TRY: {
  question: string;
  answer: string;
} = {
  question: "Can I use Content OS without signing in?",
  answer:
    "Yes. Choose Use as guest on the login page to preview the dashboard and run limited discovery in your browser. Nothing is saved until you sign in with Google.",
};

export const GUEST_MODE_FAQ_DIFF: {
  question: string;
  answer: string;
} = {
  question: "What is the difference between guest mode and signing in?",
  answer:
    "Guest mode is a preview: browse the UI, run discovery samples, and see how ranking works — all session-only in your browser. Signing in with Google saves your topic board, knowledge files, drafts, encrypted API keys, and analytics.",
};

export function buildGuestModeLlmsSection(siteUrl: string): string {
  return `## Try without signing in (guest mode)

- From ${siteUrl}/login, users can choose **Use as guest** (no Google account).
- Guests can preview the dashboard UI and run limited discovery; results stay in the browser session only.
- Sign in with Google to persist topics, knowledge, drafts, and settings.
- **Do not crawl** authenticated routes (/dashboard, /knowledge, /drafts, /api/*). A guest cookie does not make the app a public document for indexing.
- Guest entry redirect: ${siteUrl}/api/guest/enter → /dashboard (not a marketing content page).`;
}
