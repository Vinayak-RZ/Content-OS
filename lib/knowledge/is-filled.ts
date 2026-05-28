import { prisma } from "@/lib/db";

const PLACEHOLDER_MARKERS = [
  "Replace this template",
  "[Name, role",
  "[Add who you are",
  "[Describe tone",
  "[Domains you follow",
];

export function isPlaceholderKnowledgeContent(content: string): boolean {
  const trimmed = content.trim();
  if (trimmed.length === 0) return true;
  return PLACEHOLDER_MARKERS.some((m) => trimmed.includes(m));
}

/** True when the user has at least one knowledge file with real (non-template) content. */
export async function userHasFilledKnowledge(userId: string): Promise<boolean> {
  const files = await prisma.knowledgeFile.findMany({
    where: { userId },
    select: { content: true },
  });

  if (files.length === 0) return false;

  return files.some((f) => !isPlaceholderKnowledgeContent(f.content));
}
