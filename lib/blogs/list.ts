import { prisma } from "@/lib/db";
import { serializeBlogSummary } from "@/lib/blogs/serialize";
import type { SerializedBlogSummary } from "@/lib/blogs/types";

export async function listRecentBlogs(
  userId: string,
  limit = 8,
): Promise<SerializedBlogSummary[]> {
  const rows = await prisma.blogPost.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(serializeBlogSummary);
}
