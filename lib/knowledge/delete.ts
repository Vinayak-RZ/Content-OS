import { ApiError } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import { parseKnowledgeSlug } from "@/lib/knowledge/slug";

export async function deleteKnowledgeDocument(
  userId: string,
  slugRaw: string,
): Promise<void> {
  const slug = parseKnowledgeSlug(slugRaw);
  if (!slug) {
    throw new ApiError("NOT_FOUND", "Unknown knowledge document", 404);
  }

  const row = await prisma.knowledgeFile.findUnique({
    where: { userId_slug: { userId, slug } },
  });
  if (!row) {
    throw new ApiError("NOT_FOUND", "Knowledge document not found", 404);
  }
  if (row.isSystem) {
    throw new ApiError(
      "FORBIDDEN",
      "System documents cannot be deleted. Use reset to restore the template.",
      403,
    );
  }

  await prisma.$transaction([
    prisma.knowledgeChunk.deleteMany({
      where: { userId, fileName: row.fileName },
    }),
    prisma.knowledgeFile.delete({
      where: { userId_slug: { userId, slug } },
    }),
  ]);
}
