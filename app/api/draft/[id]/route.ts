import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import {
  appendDraftRevision,
  parseDraftRevisions,
} from "@/lib/drafts/revision";
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
    return NextResponse.json({
      ...draft,
      revisions: parseDraftRevisions(draft.revisionHistory),
    });
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
    let revisionHistory: Prisma.InputJsonValue = existing.revisionHistory as Prisma.InputJsonValue;

    if (parsed.data.restoreRevisionId) {
      const target = parseDraftRevisions(existing.revisionHistory).find(
        (r) => r.id === parsed.data.restoreRevisionId,
      );
      if (!target) {
        throw new ApiError("NOT_FOUND", "Revision not found", 404);
      }
      updateData.currentContent = target.content;
      updateData.selectedHook = target.hookIx;
      updateData.selectedCta = target.ctaIx;
      revisionHistory = appendDraftRevision(revisionHistory, {
        at: new Date().toISOString(),
        kind: "restore",
        label: `Restored: ${target.label}`,
        content: target.content,
        hookIx: target.hookIx,
        ctaIx: target.ctaIx,
      }) as Prisma.InputJsonValue;
      updateData.revisionHistory = revisionHistory;
    }

    if (parsed.data.currentContent !== undefined) {
      if (parsed.data.currentContent !== existing.currentContent) {
        revisionHistory = appendDraftRevision(revisionHistory, {
          at: new Date().toISOString(),
          kind: "manual",
          label: "Manual edit",
          content: existing.currentContent,
          hookIx: existing.selectedHook,
          ctaIx: existing.selectedCta,
        }) as Prisma.InputJsonValue;
        updateData.revisionHistory = revisionHistory;
      }
      updateData.currentContent = parsed.data.currentContent;
    }

    if (parsed.data.selectedHook !== undefined) {
      updateData.selectedHook = parsed.data.selectedHook;
    }
    if (parsed.data.selectedCta !== undefined) {
      updateData.selectedCta = parsed.data.selectedCta;
    }
    if (parsed.data.xThreadParts !== undefined) {
      updateData.xThreadParts = parsed.data.xThreadParts;
    }
    if (parsed.data.status !== undefined) {
      updateData.status = parsed.data.status;
      if (parsed.data.status === "published") {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await prisma.draft.update({
      where: { id: draftId },
      data: updateData,
    });

    if (parsed.data.status === "published") {
      await markTopicEngagementPublishedForDraft(session.user.id, draftId);
    }

    return NextResponse.json({
      ...updated,
      revisions: parseDraftRevisions(updated.revisionHistory),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteParams) {
  try {
    const session = await requireSession();
    const draftId = context.params.id;

    const existing = await prisma.draft.findFirst({
      where: { id: draftId, userId: session.user.id },
    });
    if (!existing) {
      throw new ApiError("NOT_FOUND", "Draft not found", 404);
    }

    await prisma.draft.delete({ where: { id: draftId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
