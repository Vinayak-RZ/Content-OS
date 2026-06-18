import { NextResponse } from "next/server";

import type { Prisma } from "@prisma/client";

import { ApiError, errorResponse } from "@/lib/api-error";
import { createInitialRevision } from "@/lib/drafts/revision";
import { canonicalizeUrl, urlSha256 } from "@/lib/discovery/urls";
import {
  draftGenerationMetaSchema,
  draftGenerationSchema,
  extractJsonObject,
} from "@/lib/generation/draft-schema";
import {
  buildGenerationBodyMessages,
  buildGenerationMessages,
  buildGenerationMetaMessages,
} from "@/lib/generation/prompts";
import {
  buildStudioGenerationBodyMessages,
  buildStudioGenerationMessages,
} from "@/lib/generation/studio-prompts";
import { draftChatComplete, draftChatStreamRequest } from "@/lib/llm/chat";
import { requireDraftProviderAuth } from "@/lib/llm/draft-provider";
import {
  encodeSseEvent,
  iterateOpenAiChatDeltas,
  sseResponse,
} from "@/lib/llm/sse-stream";
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
      sourceType: string;
      pipeline: string;
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

    const isStudio =
      trend?.pipeline === "studio" || trend?.sourceType === "studio";
    const sourceType = trend?.sourceType ?? null;
    const draftPipeline = trend?.pipeline ?? (isStudio ? "studio" : "signals");

    const retrieved = await retrieveKnowledgeContext(
      session.user.id,
      topicTitle,
      summaryBlock,
      { forStudio: isStudio },
    );

    const promptParams = {
      retrieved,
      topicTitle,
      topicSummary: summaryBlock,
      sources,
      sourceType,
      personaType: user.personaType,
      personaCustom: user.personaCustom,
    };

    if (parsed.data.stream) {
      const bodyMessages = isStudio
        ? buildStudioGenerationBodyMessages(promptParams)
        : buildGenerationBodyMessages(promptParams);

      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          let postBody = "";

          try {
            const upstream = await draftChatStreamRequest({
              provider,
              apiKey,
              messages: bodyMessages,
            });

            if (!upstream.body) {
              throw new Error("LLM stream unavailable");
            }

            for await (const delta of iterateOpenAiChatDeltas(upstream.body)) {
              postBody += delta;
              controller.enqueue(
                encodeSseEvent({ type: "delta", text: delta }),
              );
            }

            postBody = postBody.trim();
            if (postBody.length < 20) {
              throw new Error("Generated post was too short");
            }

            controller.enqueue(
              encodeSseEvent({
                type: "status",
                message: "Generating hooks and closing lines…",
              }),
            );

            let metaRaw: string;
            try {
              metaRaw = await draftChatComplete({
                provider,
                apiKey,
                messages: buildGenerationMetaMessages({
                  topicTitle,
                  post: postBody,
                  personaType: user.personaType,
                  personaCustom: user.personaCustom,
                }),
                jsonObject: true,
                temperature: 0.6,
                maxTokens: 1024,
              });
            } catch {
              metaRaw = await draftChatComplete({
                provider,
                apiKey,
                messages: buildGenerationMetaMessages({
                  topicTitle,
                  post: postBody,
                  personaType: user.personaType,
                  personaCustom: user.personaCustom,
                }),
                jsonObject: false,
                temperature: 0.6,
                maxTokens: 1024,
              });
            }

            const metaParsed = draftGenerationMetaSchema.safeParse(
              extractJsonObject(metaRaw),
            );
            if (!metaParsed.success) {
              throw new ApiError(
                "BAD_GENERATION",
                `Model output invalid: ${metaParsed.error.message}`,
                502,
              );
            }

            const draft = await prisma.draft.create({
              data: {
                userId: session.user.id,
                trendId: trend?.id ?? null,
                topicTitle: topicTitle.slice(0, 240),
                currentContent: postBody,
                hookVariants: metaParsed.data.hooks,
                ctaVariants: metaParsed.data.ctas,
                sources,
                pipeline: draftPipeline,
                status: "draft",
                revisionHistory: createInitialRevision({
                  content: postBody,
                }) as Prisma.InputJsonValue,
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

            controller.enqueue(
              encodeSseEvent({
                type: "done",
                draftId: draft.id,
                imageIdea: metaParsed.data.imageIdea,
              }),
            );
            controller.close();
          } catch (error) {
            const message =
              error instanceof ApiError
                ? error.message
                : error instanceof Error
                  ? error.message
                  : "Generation failed";
            const code =
              error instanceof ApiError ? error.code : "STREAM_ERROR";
            controller.enqueue(
              encodeSseEvent({ type: "error", message, code }),
            );
            controller.close();
          }
        },
      });

      return sseResponse(stream);
    }

    const messages = isStudio
      ? buildStudioGenerationMessages(promptParams)
      : buildGenerationMessages(promptParams);

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
        pipeline: draftPipeline,
        status: "draft",
        revisionHistory: createInitialRevision({
          content: gen.data.post,
        }) as Prisma.InputJsonValue,
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
