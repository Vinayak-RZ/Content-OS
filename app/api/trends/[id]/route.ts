import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

type RouteParams = { params: { id: string } };

export async function DELETE(_request: Request, context: RouteParams) {
  try {
    const session = await requireSession();
    const trendId = context.params.id;
    if (!trendId) {
      throw new ApiError("VALIDATION_ERROR", "Trend id required", 400);
    }

    const existing = await prisma.trend.findFirst({
      where: { id: trendId, userId: session.user.id },
      select: { id: true },
    });
    if (!existing) {
      throw new ApiError("NOT_FOUND", "Trend not found", 404);
    }

    await prisma.trend.delete({ where: { id: trendId } });

    return NextResponse.json({ ok: true, id: trendId });
  } catch (error) {
    return errorResponse(error);
  }
}
