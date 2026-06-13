import { NextResponse } from "next/server";

import type { Prisma } from "@prisma/client";

import { ApiError, errorResponse } from "@/lib/api-error";
import { createInitialRevision } from "@/lib/drafts/revision";
import { buildBlogGenerationMessages } from "@/lib/generation/blog-prompts";
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
import { blogGenerateBodySchema } from "@/lib/validations/blog";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    await consumeGenerateRateLimit(session.user.id);

    const body: unknown = await request.json();
    const parsed = blogGenerateBodySchema.safeParse(body);
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

    const { title, sourceTexts, readTimeMinutes } = parsed.data;
    const sources = sourceTexts.map((s) => s.url);

    const summaryBlock =
      sourceTexts
        .map((s) => s.excerpt)
        .join("\n")
        .slice(0, 4000) || title;

    const retrieved = await retrieveKnowledgeContext(
      session.user.id,
      title,
      summaryBlock,
    );

    const messages = buildBlogGenerationMessages({
      retrieved,
      title,
      sourceTexts,
      readTimeMinutes,
      personaType: user.personaType,
      personaCustom: user.personaCustom,
    });

    if (parsed.data.stream) {
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          let content = "";

          try {
            const upstream = await draftChatStreamRequest({
              provider,
              apiKey,
              messages,
            });

            if (!upstream.body) {
              throw new Error("LLM stream unavailable");
            }

            for await (const delta of iterateOpenAiChatDeltas(upstream.body)) {
              content += delta;
              controller.enqueue(
                encodeSseEvent({ type: "delta", text: delta }),
              );
            }

            content = content.trim();
            if (content.length < 100) {
              throw new Error("Generated blog was too short");
            }

            const blog = await prisma.blogPost.create({
              data: {
                userId: session.user.id,
                title: title.slice(0, 240),
                currentContent: content,
                sources,
                sourceTexts: sourceTexts as Prisma.InputJsonValue,
                readTimeMinutes,
                status: "draft",
                revisionHistory: createInitialRevision({
                  content,
                }) as Prisma.InputJsonValue,
              },
            });

            controller.enqueue(
              encodeSseEvent({
                type: "done",
                blogId: blog.id,
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

    let content = await draftChatComplete({
      provider,
      apiKey,
      messages,
      temperature: 0.7,
      maxTokens: 8192,
    });

    content = content.trim();
    if (content.length < 100) {
      throw new ApiError("BAD_GENERATION", "Generated blog was too short", 502);
    }

    const blog = await prisma.blogPost.create({
      data: {
        userId: session.user.id,
        title: title.slice(0, 240),
        currentContent: content,
        sources,
        sourceTexts: sourceTexts as Prisma.InputJsonValue,
        readTimeMinutes,
        status: "draft",
        revisionHistory: createInitialRevision({
          content,
        }) as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ blogId: blog.id });
  } catch (error) {
    return errorResponse(error);
  }
}
