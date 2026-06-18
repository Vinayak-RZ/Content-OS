import { prisma } from "@/lib/db";
import { isPlaceholderKnowledgeContent } from "@/lib/knowledge/is-filled";

/** Studio ideation needs real narrative + brand knowledge. */
export async function userHasStudioKnowledge(userId: string): Promise<boolean> {
  const files = await prisma.knowledgeFile.findMany({
    where: { userId, role: { in: ["narrative", "brand"] } },
    select: { content: true, role: true },
  });

  const hasNarrative = files.some(
    (f) => f.role === "narrative" && !isPlaceholderKnowledgeContent(f.content),
  );
  const hasBrand = files.some(
    (f) => f.role === "brand" && !isPlaceholderKnowledgeContent(f.content),
  );

  return hasNarrative && hasBrand;
}
