import type { ResolvedDraftProvider } from "@/lib/llm/draft-provider";
import { NVIDIA_DRAFT } from "@/lib/llm/models";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatResponse = {
  choices?: { message?: { content?: string | null } }[];
  error?: { message?: string };
};

/**
 * OpenAI-compatible chat completion (OpenRouter or NVIDIA integrate API).
 */
export async function draftChatComplete(params: {
  provider: ResolvedDraftProvider;
  apiKey: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonObject?: boolean;
}): Promise<string> {
  const {
    provider,
    apiKey,
    messages,
    temperature = 0.65,
    maxTokens = 4096,
    jsonObject = false,
  } = params;

  const url =
    provider.kind === "nvidia"
      ? `${NVIDIA_DRAFT.baseUrl}/chat/completions`
      : "https://openrouter.ai/api/v1/chat/completions";

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (provider.kind === "openrouter") {
    const appUrl =
      typeof process.env["NEXT_PUBLIC_APP_URL"] === "string"
        ? process.env["NEXT_PUBLIC_APP_URL"].trim()
        : "";
    if (appUrl) {
      headers["HTTP-Referer"] = appUrl;
      headers["X-Title"] = "Content OS";
    }
  }

  const body: Record<string, unknown> = {
    model: provider.modelId,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (jsonObject) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  const data = (await res.json()) as ChatResponse;
  if (!res.ok) {
    throw new Error(
      data.error?.message ?? `LLM request failed (${res.status})`,
    );
  }

  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Empty LLM response");
  }
  return text.trim();
}
