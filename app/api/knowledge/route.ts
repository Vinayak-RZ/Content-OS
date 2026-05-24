import { NextResponse } from "next/server";
import { Buffer } from "buffer";

import { ApiError, errorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import { createKnowledgeDocument } from "@/lib/knowledge/create";
import { loadLinkedInProfileTemplate } from "@/lib/knowledge/templates";
import { requireSession } from "@/lib/session";
import { knowledgeCreateSchema } from "@/lib/validations/knowledge";
import { MAX_KNOWLEDGE_BYTES } from "@/lib/knowledge/constants";

export async function GET() {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    const files = await prisma.knowledgeFile.findMany({
      where: { userId },
      select: {
        slug: true,
        fileName: true,
        displayName: true,
        role: true,
        sortOrder: true,
        isSystem: true,
        updatedAt: true,
        fileVersion: true,
      },
      orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
    });

    const counts = await prisma.knowledgeChunk.groupBy({
      by: ["fileName"],
      where: { userId },
      _count: { _all: true },
    });
    const chunkByFile = Object.fromEntries(
      counts.map((c) => [c.fileName, c._count._all]),
    );

    return NextResponse.json({
      files: files.map((f) => ({
        slug: f.slug,
        fileName: f.fileName,
        displayName: f.displayName,
        role: f.role,
        sortOrder: f.sortOrder,
        isSystem: f.isSystem,
        updatedAt: f.updatedAt.toISOString(),
        fileVersion: f.fileVersion,
        chunkCount: chunkByFile[f.fileName] ?? 0,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body: unknown = await request.json();
    const parsed = knowledgeCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    let content = parsed.data.content ?? "";
    if (parsed.data.template === "linkedin-profile" && !content.trim()) {
      content = await loadLinkedInProfileTemplate();
    }

    const byteLen = Buffer.byteLength(content, "utf8");
    if (byteLen > MAX_KNOWLEDGE_BYTES) {
      throw new ApiError(
        "VALIDATION_ERROR",
        `Content exceeds ${MAX_KNOWLEDGE_BYTES} bytes`,
        400,
      );
    }

    const created = await createKnowledgeDocument(session.user.id, {
      slug: parsed.data.slug,
      displayName: parsed.data.displayName,
      role: parsed.data.role,
      content,
    });

    return NextResponse.json(
      {
        slug: created.slug,
        fileName: created.fileName,
        displayName: created.displayName,
        role: created.role,
        isSystem: created.isSystem,
        fileVersion: created.fileVersion,
        updatedAt: created.updatedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
