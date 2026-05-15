import { NextResponse } from "next/server";
import { Buffer } from "buffer";
import { ApiError, errorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import { MAX_KNOWLEDGE_BYTES } from "@/lib/knowledge/constants";
import { parseKnowledgeFileName } from "@/lib/knowledge/file-name";
import { syncKnowledgeFile } from "@/lib/knowledge/sync";
import { requireSession } from "@/lib/session";
import { knowledgePutSchema } from "@/lib/validations/knowledge";

type RouteContext = { params: { fileName: string } };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const { fileName: raw } = context.params;
    const fileName = parseKnowledgeFileName(raw);
    if (!fileName) {
      throw new ApiError("NOT_FOUND", "Unknown knowledge file", 404);
    }

    const row = await prisma.knowledgeFile.findFirst({
      where: { userId: session.user.id, fileName },
    });
    if (!row) {
      throw new ApiError("NOT_FOUND", "Knowledge file not found", 404);
    }

    return NextResponse.json({
      fileName: row.fileName,
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
    const { fileName: raw } = context.params;
    const fileName = parseKnowledgeFileName(raw);
    if (!fileName) {
      throw new ApiError("NOT_FOUND", "Unknown knowledge file", 404);
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

    const updated = await syncKnowledgeFile(
      session.user.id,
      fileName,
      parsed.data.content,
    );

    return NextResponse.json({
      fileName: updated.fileName,
      fileVersion: updated.fileVersion,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
