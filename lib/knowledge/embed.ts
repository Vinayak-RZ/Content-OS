import { requireOpenAiApiKey } from "@/lib/env";

const EMBED_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 64;

type EmbedResponse = {
  data?: { embedding: number[] }[];
  error?: { message?: string };
};

async function embedBatch(texts: string[]): Promise<number[][]> {
  const key = requireOpenAiApiKey();
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: texts,
    }),
  });
  const body = (await res.json()) as EmbedResponse;
  if (!res.ok) {
    throw new Error(body.error?.message ?? `Embedding request failed (${res.status})`);
  }
  const vectors = body.data?.map((d) => d.embedding) ?? [];
  if (vectors.length !== texts.length) {
    throw new Error("Embedding count mismatch");
  }
  return vectors;
}

/** One vector per input string, preserving order */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const slice = texts.slice(i, i + BATCH_SIZE);
    const batch = await embedBatch(slice);
    out.push(...batch);
  }
  return out;
}
