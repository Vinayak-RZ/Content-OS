import type { Prisma } from "@prisma/client";

import { ApiError } from "@/lib/api-error";
import { prisma } from "@/lib/db";

export type BlogPostDelegate = {
  findMany: (args: Prisma.BlogPostFindManyArgs) => Promise<Prisma.BlogPostGetPayload<object>[]>;
  findFirst: (
    args: Prisma.BlogPostFindFirstArgs,
  ) => Promise<Prisma.BlogPostGetPayload<object> | null>;
  create: (args: Prisma.BlogPostCreateArgs) => Promise<Prisma.BlogPostGetPayload<object>>;
  update: (args: Prisma.BlogPostUpdateArgs) => Promise<Prisma.BlogPostGetPayload<object>>;
  delete: (args: Prisma.BlogPostDeleteArgs) => Promise<Prisma.BlogPostGetPayload<object>>;
};

const BLOG_DATASTORE_MESSAGE =
  "Blog storage is not ready. Run npm run db:migrate and npm run db:generate, then restart the dev server.";

/** Prisma delegate when BlogPost exists on the generated client; null after stale client or missing generate. */
export function getBlogPostDelegate(): BlogPostDelegate | null {
  const delegate = (
    prisma as unknown as { blogPost?: BlogPostDelegate }
  ).blogPost;
  if (!delegate?.findMany) return null;
  return delegate;
}

export function requireBlogPostDelegate(): BlogPostDelegate {
  const delegate = getBlogPostDelegate();
  if (!delegate) {
    throw new ApiError("BLOG_DATASTORE_UNAVAILABLE", BLOG_DATASTORE_MESSAGE, 503);
  }
  return delegate;
}
