import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { errorResponse } from "@/lib/api-error";
import { requireSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    const files = await prisma.knowledgeFile.findMany({
      where: { userId },
      select: {
        fileName: true,
        updatedAt: true,
        fileVersion: true,
      },
      orderBy: { fileName: "asc" },
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
        ...f,
        chunkCount: chunkByFile[f.fileName] ?? 0,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
