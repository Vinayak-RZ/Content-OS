import { GITHUB_REPO_URL } from "@/lib/github-links";

/** Maintainer GitHub profile (repo owner). */
export const GITHUB_PROFILE_URL = "https://github.com/Vinayak-RZ";

export const FOUNDER_NAME = "Vinayak Raizada";

export const FOUNDER_LINKEDIN_URL =
  "https://www.linkedin.com/in/vinayak-rz/";

export const FOUNDER_X_URL = "https://x.com/VinayakRaizada";

/** Public profiles for Organization / Person sameAs. */
export const FOUNDER_SOCIAL_URLS = [
  FOUNDER_LINKEDIN_URL,
  FOUNDER_X_URL,
] as const;

export function buildSiteSameAs(): readonly string[] {
  return [
    GITHUB_REPO_URL,
    GITHUB_PROFILE_URL,
    ...FOUNDER_SOCIAL_URLS,
  ];
}
