import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { feedbackPatchToFields } from "@/lib/discovery/carry-over";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { trendFeedbackPatchSchema } from "@/lib/validations/trends";

type RouteParams = { params: { id: string } };

export async function PATCH(request: Request, context: RouteParams) {
  try {
    const session = await requireSession();
    const trendId = context.params.id;
    if (!trendId) {
      throw new ApiError("VALIDATION_ERROR", "Trend id required", 400);
    }

    const body: unknown = await request.json();
    const parsed = trendFeedbackPatchSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    const patch = feedbackPatchToFields(parsed.data.feedback);

    const existing = await prisma.trend.findFirst({
      where: { id: trendId, userId: session.user.id },
      select: { id: true },
    });
    if (!existing) {
      throw new ApiError("NOT_FOUND", "Trend not found", 404);
    }

    const updated = await prisma.trend.update({
      where: { id: trendId },
      data: patch,
      select: {
        id: true,
        feedbackStatus: true,
        feedbackAt: true,
        savedUntil: true,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
