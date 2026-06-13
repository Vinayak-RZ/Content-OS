import type { BlogPost } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  isBlogDatastoreError,
  logBlogDatastoreWarning,
} from "@/lib/blogs/is-available";
import { serializeBlogSummary } from "@/lib/blogs/serialize";
import type { SerializedBlogSummary } from "@/lib/blogs/types";

export async function listRecentBlogs(
  userId: string,
  limit = 8,
): Promise<SerializedBlogSummary[]> {
  const blogDelegate = (
    prisma as unknown as {
      blogPost?: { findMany: (args: unknown) => Promise<unknown[]> };
    }
  ).blogPost;

  if (!blogDelegate?.findMany) {
    logBlogDatastoreWarning(
      new Error("Prisma client missing BlogPost model — run npm run db:generate"),
    );
    return [];
  }

  try {
    const rows = (await blogDelegate.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })) as BlogPost[];
    return rows.map(serializeBlogSummary);
  } catch (error) {
    if (isBlogDatastoreError(error)) {
      logBlogDatastoreWarning(error);
      return [];
    }
    throw error;
  }
}
