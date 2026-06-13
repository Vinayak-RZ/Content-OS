import {
  isBlogDatastoreError,
  logBlogDatastoreWarning,
} from "@/lib/blogs/is-available";
import { getBlogPostDelegate } from "@/lib/blogs/prisma";
import { serializeBlogSummary } from "@/lib/blogs/serialize";
import type { SerializedBlogSummary } from "@/lib/blogs/types";

export async function listRecentBlogs(
  userId: string,
  limit = 8,
): Promise<SerializedBlogSummary[]> {
  const blogPost = getBlogPostDelegate();
  if (!blogPost) {
    logBlogDatastoreWarning(
      new Error(
        "Prisma client missing BlogPost model — run npm run db:generate and restart the dev server",
      ),
    );
    return [];
  }

  try {
    const rows = await blogPost.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(serializeBlogSummary);
  } catch (error) {
    if (isBlogDatastoreError(error)) {
      logBlogDatastoreWarning(error);
      return [];
    }
    throw error;
  }
}
