export type AppSseEvent =
  | { type: "delta"; text: string }
  | { type: "status"; message: string }
  | { type: "done"; draft: unknown }
  | { type: "done"; draftId: string; imageIdea?: string }
  | { type: "error"; message: string; code?: string };

export type ConsumeAppSseOptions = {
  onDelta?: (chunk: string, accumulated: string) => void;
  onStatus?: (message: string) => void;
};

function parseSseBuffer(buffer: string): {
  events: AppSseEvent[];
  rest: string;
} {
  const events: AppSseEvent[] = [];
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";

  for (const part of parts) {
    for (const line of part.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload) continue;
      try {
        events.push(JSON.parse(payload) as AppSseEvent);
      } catch {
        // skip malformed events
      }
    }
  }

  return { events, rest };
}

/**
 * Reads an app SSE response body until done or error.
 */
export async function consumeAppSseStream(
  response: Response,
  options: ConsumeAppSseOptions = {},
): Promise<AppSseEvent> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/event-stream")) {
    const json: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        typeof json === "object" &&
        json &&
        "error" in json &&
        typeof (json as { error?: string }).error === "string"
          ? (json as { error: string }).error
          : `Request failed (${response.status})`;
      throw new Error(message);
    }
    return { type: "done", draft: json };
  }

  if (!response.body) {
    throw new Error("Empty stream response");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";
  let doneEvent: AppSseEvent | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSseBuffer(buffer);
      buffer = parsed.rest;

      for (const event of parsed.events) {
        if (event.type === "delta") {
          accumulated += event.text;
          options.onDelta?.(event.text, accumulated);
        } else if (event.type === "status") {
          options.onStatus?.(event.message);
        } else if (event.type === "done") {
          doneEvent = event;
        } else if (event.type === "error") {
          throw new Error(event.message);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (buffer.trim()) {
    const parsed = parseSseBuffer(`${buffer}\n\n`);
    for (const event of parsed.events) {
      if (event.type === "delta") {
        accumulated += event.text;
        options.onDelta?.(event.text, accumulated);
      } else if (event.type === "status") {
        options.onStatus?.(event.message);
      } else if (event.type === "done") {
        doneEvent = event;
      } else if (event.type === "error") {
        throw new Error(event.message);
      }
    }
  }

  if (!doneEvent) {
    throw new Error("Stream ended without a result");
  }

  return doneEvent;
}
