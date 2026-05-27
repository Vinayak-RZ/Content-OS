import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { appendDraftRevision } from "@/lib/drafts/revision";
import { buildEditMessages } from "@/lib/generation/prompts";
import { draftChatComplete } from "@/lib/llm/chat";
import { requireDraftProviderAuth } from "@/lib/llm/draft-provider";
import { prisma } from "@/lib/db";
import { consumeGenerateRateLimit } from "@/lib/rate-limit";
import { fetchWritingStyleText } from "@/lib/retrieval";
import { requireSession } from "@/lib/session";
import { draftEditBodySchema } from "@/lib/validations/draft-edit";

export const maxDuration = 300;

type RouteParams = { params: { id: string } };

export async function POST(request: Request, context: RouteParams) {
  try {
    const session = await requireSession();
    await consumeGenerateRateLimit(session.user.id);

    const draftId = context.params.id;
    const draft = await prisma.draft.findFirst({
      where: { id: draftId, userId: session.user.id },
    });
    if (!draft) {
      throw new ApiError("NOT_FOUND", "Draft not found", 404);
    }

    const body: unknown = await request.json();
    const parsed = draftEditBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    if (
      parsed.data.command === "custom" &&
      !(parsed.data.customInstruction ?? "").trim()
    ) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "customInstruction required for custom command",
        400,
      );
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });
    const { provider, apiKey } = requireDraftProviderAuth(user);

    const writingStyle = await fetchWritingStyleText(session.user.id);

    const messages = buildEditMessages({
      retrievedWritingStyle: writingStyle,
      currentDraft: draft.currentContent,
      command: parsed.data.command,
      customInstruction: parsed.data.customInstruction,
      personaType: user.personaType,
      personaCustom: user.personaCustom,
    });

    const newContent = await draftChatComplete({
      provider,
      apiKey,
      messages,
      jsonObject: false,
      temperature: 0.55,
    });

    const updated = await prisma.draft.update({
      where: { id: draftId },
      data: {
        currentContent: newContent,
        revisionHistory: appendDraftRevision(draft.revisionHistory, {
          command: parsed.data.command,
          at: new Date().toISOString(),
        }) as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ draft: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
