import { readFile } from "fs/promises";
import { join } from "path";

/** Literal segments only - avoids Next.js tracing the whole repo on deploy. */
const LINKEDIN_PROFILE_TEMPLATE_PATH = join(
  process.cwd(),
  "seeds",
  "templates",
  "linkedin-profile.md",
);

const LINKEDIN_PROFILE_FALLBACK =
  "# LinkedIn profile\n\n(Paste your profile details here.)\n";

export async function loadLinkedInProfileTemplate(): Promise<string> {
  try {
    return await readFile(LINKEDIN_PROFILE_TEMPLATE_PATH, "utf8");
  } catch {
    return LINKEDIN_PROFILE_FALLBACK;
  }
}
