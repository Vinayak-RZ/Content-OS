import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { canonicalizeUrl, urlSha256 } from "@/lib/discovery/urls";
import {
  draftGenerationSchema,
  extractJsonObject,
} from "@/lib/generation/draft-schema";
import { buildGenerationMessages } from "@/lib/generation/prompts";
import { draftChatComplete } from "@/lib/llm/chat";
import { requireDraftProviderAuth } from "@/lib/llm/draft-provider";
import { prisma } from "@/lib/db";
import { consumeGenerateRateLimit } from "@/lib/rate-limit";
import { retrieveKnowledgeContext } from "@/lib/retrieval";
import { requireSession } from "@/lib/session";
import { recordTopicEngagementSelected } from "@/lib/topic-memory";
import { generateDraftBodySchema } from "@/lib/validations/generate";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    await consumeGenerateRateLimit(session.user.id);

    const body: unknown = await request.json();
    const parsed = generateDraftBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });
    const { provider, apiKey } = requireDraftProviderAuth(user);

    let topicTitle = "";
    let topicSummary = "";
    const sources: string[] = [];
    let trend: {
      id: string;
      title: string;
      summary: string;
      url: string;
      urlHash: string;
    } | null = null;

    if (parsed.data.trendId) {
      const row = await prisma.trend.findFirst({
        where: {
          id: parsed.data.trendId,
          userId: session.user.id,
        },
      });
      if (!row) {
        throw new ApiError("NOT_FOUND", "Trend not found", 404);
      }
      trend = row;
      topicTitle = row.title;
      topicSummary = row.summary;
      sources.push(row.url);
    } else if (parsed.data.customTopic) {
      const c = parsed.data.customTopic;
      topicTitle = c.title;
      topicSummary = (c.summary ?? "").trim();
      if (c.url) {
        sources.push(canonicalizeUrl(c.url));
      }
    }

    const summaryBlock =
      topicSummary.length > 0 ? topicSummary : topicTitle;

    const retrieved = await retrieveKnowledgeContext(
      session.user.id,
      topicTitle,
      summaryBlock,
    );

    const messages = buildGenerationMessages({
      retrieved,
      topicTitle,
      topicSummary: summaryBlock,
      sources,
    });

    let raw: string;
    try {
      raw = await draftChatComplete({
        provider,
        apiKey,
        messages,
        jsonObject: true,
      });
    } catch {
      raw = await draftChatComplete({
        provider,
        apiKey,
        messages,
        jsonObject: false,
      });
    }

    const jsonUnknown = extractJsonObject(raw);
    const gen = draftGenerationSchema.safeParse(jsonUnknown);
    if (!gen.success) {
      throw new ApiError(
        "BAD_GENERATION",
        `Model output invalid: ${gen.error.message}`,
        502,
      );
    }

    const draft = await prisma.draft.create({
      data: {
        userId: session.user.id,
        trendId: trend?.id ?? null,
        topicTitle: topicTitle.slice(0, 240),
        currentContent: gen.data.post,
        hookVariants: gen.data.hooks,
        ctaVariants: gen.data.ctas,
        sources,
        status: "draft",
      },
    });

    let urlHash: string | null = trend?.urlHash ?? null;
    if (!urlHash && parsed.data.customTopic?.url) {
      urlHash = urlSha256(canonicalizeUrl(parsed.data.customTopic.url));
    }

    await recordTopicEngagementSelected({
      userId: session.user.id,
      trendId: trend?.id ?? null,
      draftId: draft.id,
      topicTitle: draft.topicTitle,
      summaryForEmbed: summaryBlock,
      urlHash,
    });

    return NextResponse.json({
      draftId: draft.id,
      imageIdea: gen.data.imageIdea,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
