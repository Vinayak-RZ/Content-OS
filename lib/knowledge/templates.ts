import { readFile } from "fs/promises";
import { join } from "path";

import { KNOWLEDGE_TEMPLATE_DIR } from "@/lib/knowledge/constants";

export async function loadKnowledgeTemplate(
  baseName: string,
): Promise<string | null> {
  const safe = baseName.replace(/[^a-z0-9-]/gi, "");
  const file = safe.endsWith(".md") ? safe : `${safe}.md`;
  try {
    return await readFile(
      join(process.cwd(), ...KNOWLEDGE_TEMPLATE_DIR, file),
      "utf8",
    );
  } catch {
    return null;
  }
}

export async function loadLinkedInProfileTemplate(): Promise<string> {
  const content = await loadKnowledgeTemplate("linkedin-profile");
  return (
    content ??
    "# LinkedIn profile\n\n(Paste your profile details here.)\n"
  );
}
