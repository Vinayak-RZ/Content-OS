import type { ResolvedDraftProvider } from "@/lib/llm/draft-provider";
import {
  type ChatMessage,
  draftChatStreamRequest,
} from "@/lib/llm/chat";

export type AppSseEvent =
  | { type: "delta"; text: string }
  | { type: "status"; message: string }
  | { type: "done"; draft: unknown }
  | { type: "done"; draftId: string; imageIdea?: string }
  | { type: "done"; blogId: string }
  | { type: "error"; message: string; code?: string };

export function encodeSseEvent(data: AppSseEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function* iterateOpenAiChatDeltas(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") return;

        try {
          const json = JSON.parse(payload) as {
            choices?: { delta?: { content?: string | null } }[];
          };
          const delta = json.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta.length > 0) {
            yield delta;
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

type StreamChatToSseParams = {
  provider: ResolvedDraftProvider;
  apiKey: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  onComplete: (fullText: string) => Promise<AppSseEvent>;
};

/**
 * Opens an upstream OpenAI-compatible stream and re-emits app SSE events.
 */
export function streamChatCompletionToSse(
  params: StreamChatToSseParams,
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let fullText = "";

      try {
        const upstream = await draftChatStreamRequest({
          provider: params.provider,
          apiKey: params.apiKey,
          messages: params.messages,
          temperature: params.temperature,
          maxTokens: params.maxTokens,
        });

        if (!upstream.body) {
          throw new Error("LLM stream unavailable");
        }

        for await (const delta of iterateOpenAiChatDeltas(upstream.body)) {
          fullText += delta;
          controller.enqueue(encodeSseEvent({ type: "delta", text: delta }));
        }

        const trimmed = fullText.trim();
        if (trimmed.length === 0) {
          throw new Error("Empty LLM response");
        }

        const doneEvent = await params.onComplete(trimmed);
        controller.enqueue(encodeSseEvent(doneEvent));
        controller.close();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Stream failed";
        controller.enqueue(
          encodeSseEvent({ type: "error", message, code: "STREAM_ERROR" }),
        );
        controller.close();
      }
    },
  });
}
