import { NextResponse } from "next/server";
import { Buffer } from "buffer";

import { ApiError, errorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import { deleteKnowledgeDocument } from "@/lib/knowledge/delete";
import { MAX_KNOWLEDGE_BYTES } from "@/lib/knowledge/constants";
import { resetSystemKnowledgeFromRepo } from "@/lib/knowledge/seed";
import { parseKnowledgeSlugOrFileName } from "@/lib/knowledge/slug";
import { syncKnowledgeFile } from "@/lib/knowledge/sync";
import { requireSession } from "@/lib/session";
import { knowledgePutSchema } from "@/lib/validations/knowledge";

type RouteContext = { params: { slug: string } };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { slug: raw } = context.params;
    const slug = parseKnowledgeSlugOrFileName(raw);
    if (!slug) {
      throw new ApiError("NOT_FOUND", "Unknown knowledge document", 404);
    }

    const row = await prisma.knowledgeFile.findFirst({
      where: { userId: session.user.id, slug },
    });
    if (!row) {
      throw new ApiError("NOT_FOUND", "Knowledge document not found", 404);
    }

    return NextResponse.json({
      slug: row.slug,
      fileName: row.fileName,
      displayName: row.displayName,
      role: row.role,
      isSystem: row.isSystem,
      content: row.content,
      fileVersion: row.fileVersion,
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { slug: raw } = context.params;
    const slug = parseKnowledgeSlugOrFileName(raw);
    if (!slug) {
      throw new ApiError("NOT_FOUND", "Unknown knowledge document", 404);
    }

    const body: unknown = await request.json();
    const parsed = knowledgePutSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    const byteLen = Buffer.byteLength(parsed.data.content, "utf8");
    if (byteLen > MAX_KNOWLEDGE_BYTES) {
      throw new ApiError(
        "VALIDATION_ERROR",
        `Content exceeds ${MAX_KNOWLEDGE_BYTES} bytes`,
        400,
      );
    }

    const exists = await prisma.knowledgeFile.findFirst({
      where: { userId: session.user.id, slug },
    });
    if (!exists) {
      throw new ApiError("NOT_FOUND", "Knowledge document not found", 404);
    }

    if (exists.isAgentManaged) {
      throw new ApiError(
        "FORBIDDEN",
        "Agent-managed insight files cannot be edited manually. View them on the Improve page.",
        403,
      );
    }

    const updated = await syncKnowledgeFile(
      session.user.id,
      slug,
      parsed.data.content,
    );

    return NextResponse.json({
      slug: updated.slug,
      fileName: updated.fileName,
      displayName: updated.displayName,
      role: updated.role,
      isSystem: updated.isSystem,
      fileVersion: updated.fileVersion,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { slug: raw } = context.params;
    const slug = parseKnowledgeSlugOrFileName(raw);
    if (!slug) {
      throw new ApiError("NOT_FOUND", "Unknown knowledge document", 404);
    }

    const url = new URL(request.url);
    const reset = url.searchParams.get("reset") === "true";

    const row = await prisma.knowledgeFile.findFirst({
      where: { userId: session.user.id, slug },
    });
    if (!row) {
      throw new ApiError("NOT_FOUND", "Knowledge document not found", 404);
    }

    if (row.isAgentManaged && !reset) {
      throw new ApiError(
        "FORBIDDEN",
        "Agent-managed insight files cannot be deleted manually.",
        403,
      );
    }

    if (reset && row.isSystem) {
      await resetSystemKnowledgeFromRepo(session.user.id, slug);
      const updated = await prisma.knowledgeFile.findUniqueOrThrow({
        where: { userId_slug: { userId: session.user.id, slug } },
      });
      return NextResponse.json({
        slug: updated.slug,
        reset: true,
        fileVersion: updated.fileVersion,
        updatedAt: updated.updatedAt.toISOString(),
      });
    }

    await deleteKnowledgeDocument(session.user.id, slug);
    return NextResponse.json({ slug, deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
