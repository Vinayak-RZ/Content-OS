import { consumeAppSseStream } from "@/lib/client/app-sse";
import { formatDraftApiError } from "@/lib/client/draft-api-error";
import type { BlogSourceText } from "@/lib/blogs/types";
import type { ReadTimeOption } from "@/lib/blogs/read-time";

type GenerateBlogStreamBody = {
  title: string;
  sourceTexts: BlogSourceText[];
  readTimeMinutes: ReadTimeOption;
};

type GenerateBlogStreamOptions = {
  body: GenerateBlogStreamBody;
  onDelta: (accumulated: string) => void;
  onStatus?: (message: string) => void;
};

export async function generateBlogStream({
  body,
  onDelta,
  onStatus,
}: GenerateBlogStreamOptions): Promise<{ blogId: string }> {
  const res = await fetch("/api/blog/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, stream: true }),
  });

  if (!res.ok && !(res.headers.get("content-type") ?? "").includes("text/event-stream")) {
    const json: unknown = await res.json().catch(() => ({}));
    throw new Error(formatDraftApiError(json, `Blog generation failed (${res.status})`));
  }

  const done = await consumeAppSseStream(res, {
    onDelta: (_chunk, accumulated) => onDelta(accumulated),
    onStatus,
  });

  if (done.type !== "done" || !("blogId" in done) || typeof done.blogId !== "string") {
    throw new Error("Generation finished without a blog id");
  }

  return { blogId: done.blogId };
}
