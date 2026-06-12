import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { appendDraftRevision } from "@/lib/drafts/revision";
import { extractJsonObject } from "@/lib/generation/draft-schema";
import { xThreadGenerationSchema } from "@/lib/generation/x-thread-schema";
import {
  buildXThreadMessages,
  validateXThreadTweets,
} from "@/lib/generation/x-thread-prompts";
import { draftChatComplete } from "@/lib/llm/chat";
import { requireDraftProviderAuth } from "@/lib/llm/draft-provider";
import { prisma } from "@/lib/db";
import { consumeGenerateRateLimit } from "@/lib/rate-limit";
import { fetchWritingStyleText } from "@/lib/retrieval";
import { requireSession } from "@/lib/session";

export const maxDuration = 300;

type RouteParams = { params: { id: string } };

function assembleLinkedInPost(draft: {
  hookVariants: string[];
  ctaVariants: string[];
  selectedHook: number;
  selectedCta: number;
  currentContent: string;
}): string {
  const hook = draft.hookVariants[draft.selectedHook] ?? "";
  const cta = draft.ctaVariants[draft.selectedCta] ?? "";
  return `${hook}\n\n${draft.currentContent}\n\n${cta}`.trim();
}

export async function POST(_request: Request, context: RouteParams) {
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

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });
    const { provider, apiKey } = requireDraftProviderAuth(user);
    const writingStyle = await fetchWritingStyleText(session.user.id);
    const linkedInPost = assembleLinkedInPost(draft);

    let raw: string;
    try {
      raw = await draftChatComplete({
        provider,
        apiKey,
        messages: buildXThreadMessages({
          linkedInPost,
          topicTitle: draft.topicTitle,
          retrievedWritingStyle: writingStyle,
          personaType: user.personaType,
          personaCustom: user.personaCustom,
        }),
        jsonObject: true,
        temperature: 0.65,
        maxTokens: 1200,
      });
    } catch {
      raw = await draftChatComplete({
        provider,
        apiKey,
        messages: buildXThreadMessages({
          linkedInPost,
          topicTitle: draft.topicTitle,
          retrievedWritingStyle: writingStyle,
          personaType: user.personaType,
          personaCustom: user.personaCustom,
        }),
        jsonObject: false,
        temperature: 0.65,
        maxTokens: 1200,
      });
    }

    const parsed = xThreadGenerationSchema.safeParse(extractJsonObject(raw));
    if (!parsed.success) {
      throw new ApiError(
        "BAD_GENERATION",
        `X thread output invalid: ${parsed.error.message}`,
        502,
      );
    }

    const tweets = validateXThreadTweets(parsed.data.tweets);

    const updated = await prisma.draft.update({
      where: { id: draftId },
      data: {
        xThreadParts: tweets,
        revisionHistory: appendDraftRevision(draft.revisionHistory, {
          at: new Date().toISOString(),
          kind: "x_thread",
          label: `X thread (${tweets.length} tweets)`,
          content: draft.currentContent,
          hookIx: draft.selectedHook,
          ctaIx: draft.selectedCta,
        }) as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      xThreadParts: updated.xThreadParts,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
