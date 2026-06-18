import { prisma } from "@/lib/db";
import { isPlaceholderKnowledgeContent } from "@/lib/knowledge/is-filled";

/** Studio ideation needs at least one filled Studio-role document. */
export async function userHasStudioKnowledge(userId: string): Promise<boolean> {
  const files = await prisma.knowledgeFile.findMany({
    where: { userId, role: "studio" },
    select: { content: true },
  });

  if (files.length === 0) return false;

  return files.some((f) => !isPlaceholderKnowledgeContent(f.content));
}
