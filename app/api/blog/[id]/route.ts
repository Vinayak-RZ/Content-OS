import { NextResponse } from "next/server";

import type { Prisma } from "@prisma/client";

import { ApiError, errorResponse } from "@/lib/api-error";
import { serializeBlogPost } from "@/lib/blogs/serialize";
import { requireBlogPostDelegate } from "@/lib/blogs/prisma";
import { appendDraftRevision } from "@/lib/drafts/revision";
import { requireSession } from "@/lib/session";
import { blogPatchBodySchema } from "@/lib/validations/blog";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const blogPost = requireBlogPostDelegate();
    const { id } = await context.params;

    const blog = await blogPost.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!blog) {
      throw new ApiError("NOT_FOUND", "Blog not found", 404);
    }

    return NextResponse.json({ blog: serializeBlogPost(blog) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const blogPost = requireBlogPostDelegate();
    const { id } = await context.params;

    const existing = await blogPost.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      throw new ApiError("NOT_FOUND", "Blog not found", 404);
    }

    const body: unknown = await request.json();
    const parsed = blogPatchBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    const data: Prisma.BlogPostUpdateInput = {};

    if (parsed.data.title != null) {
      data.title = parsed.data.title.slice(0, 240);
    }

    if (parsed.data.currentContent != null) {
      const nextContent = parsed.data.currentContent;
      if (nextContent !== existing.currentContent) {
        data.currentContent = nextContent;
        data.revisionHistory = appendDraftRevision(existing.revisionHistory, {
          at: new Date().toISOString(),
          kind: "manual",
          label: "Manual edit",
          content: nextContent,
          hookIx: 0,
          ctaIx: 0,
        }) as Prisma.InputJsonValue;
      }
    }

    if (parsed.data.status != null) {
      data.status = parsed.data.status;
      data.publishedAt =
        parsed.data.status === "published" ? new Date() : null;
    }

    const blog = await blogPost.update({
      where: { id },
      data,
    });

    return NextResponse.json({ blog: serializeBlogPost(blog) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const blogPost = requireBlogPostDelegate();
    const { id } = await context.params;

    const existing = await blogPost.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      throw new ApiError("NOT_FOUND", "Blog not found", 404);
    }

    await blogPost.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
