import { consumeAppSseStream } from "@/lib/client/app-sse";
import { formatDraftApiError } from "@/lib/client/draft-api-error";

type GenerateDraftStreamBody = {
  trendId?: string;
  customTopic?: {
    title: string;
    summary?: string;
    url?: string;
  };
};

type GenerateDraftStreamOptions = {
  body: GenerateDraftStreamBody;
  onDelta: (accumulated: string) => void;
  onStatus?: (message: string) => void;
};

export async function generateDraftStream({
  body,
  onDelta,
  onStatus,
}: GenerateDraftStreamOptions): Promise<{ draftId: string; imageIdea?: string }> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, stream: true }),
  });

  if (!res.ok && !(res.headers.get("content-type") ?? "").includes("text/event-stream")) {
    const json: unknown = await res.json().catch(() => ({}));
    throw new Error(formatDraftApiError(json, `Generate failed (${res.status})`));
  }

  const done = await consumeAppSseStream(res, {
    onDelta: (_chunk, accumulated) => onDelta(accumulated),
    onStatus,
  });

  if (done.type !== "done" || !("draftId" in done) || typeof done.draftId !== "string") {
    throw new Error("Generation finished without a draft id");
  }

  return {
    draftId: done.draftId,
    imageIdea: "imageIdea" in done ? done.imageIdea : undefined,
  };
}
