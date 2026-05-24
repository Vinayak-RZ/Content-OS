import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { appendDraftRevision } from "@/lib/drafts/revision";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { markTopicEngagementPublishedForDraft } from "@/lib/topic-memory";
import { draftPatchSchema } from "@/lib/validations/draft";

export const maxDuration = 300;

type RouteParams = { params: { id: string } };

export async function GET(_request: Request, context: RouteParams) {
  try {
    const session = await requireSession();
    const draft = await prisma.draft.findFirst({
      where: {
        id: context.params.id,
        userId: session.user.id,
      },
      include: {
        trend: {
          select: {
            url: true,
            title: true,
            summary: true,
            source: true,
          },
        },
      },
    });
    if (!draft) {
      throw new ApiError("NOT_FOUND", "Draft not found", 404);
    }
    return NextResponse.json(draft);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteParams) {
  try {
    const session = await requireSession();
    const draftId = context.params.id;

    const existing = await prisma.draft.findFirst({
      where: { id: draftId, userId: session.user.id },
    });
    if (!existing) {
      throw new ApiError("NOT_FOUND", "Draft not found", 404);
    }

    const body: unknown = await request.json();
    const parsed = draftPatchSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    const updateData: Prisma.DraftUpdateInput = {};

    if (parsed.data.currentContent !== undefined) {
      updateData.currentContent = parsed.data.currentContent;
      updateData.revisionHistory = appendDraftRevision(
        existing.revisionHistory,
        {
          kind: "manual_patch",
          at: new Date().toISOString(),
        },
      ) as Prisma.InputJsonValue;
    }
    if (parsed.data.selectedHook !== undefined) {
      updateData.selectedHook = parsed.data.selectedHook;
    }
    if (parsed.data.selectedCta !== undefined) {
      updateData.selectedCta = parsed.data.selectedCta;
    }
    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status;
    }

    const updated = await prisma.draft.update({
      where: { id: draftId },
      data: updateData,
    });

    if (parsed.data.status === "published") {
      await markTopicEngagementPublishedForDraft(session.user.id, draftId);
    }

    return NextResponse.json(updated);
  } catch (error) {
    return errorResponse(error);
  }
}
