import { NextResponse } from "next/server";

import type { Prisma } from "@prisma/client";

import { ApiError, errorResponse } from "@/lib/api-error";
import { createInitialRevision } from "@/lib/drafts/revision";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { createDraftBodySchema } from "@/lib/validations/draft";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body: unknown = await request.json();
    const parsed = createDraftBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    const content = parsed.data.currentContent?.trim() ?? "";
    const topicTitle = parsed.data.topicTitle.trim().slice(0, 240);

    const draft = await prisma.draft.create({
      data: {
        userId: session.user.id,
        trendId: null,
        topicTitle,
        currentContent: content,
        hookVariants: [],
        ctaVariants: [],
        sources: [],
        status: "draft",
        revisionHistory: createInitialRevision({
          content,
        }) as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ draftId: draft.id });
  } catch (error) {
    return errorResponse(error);
  }
}
