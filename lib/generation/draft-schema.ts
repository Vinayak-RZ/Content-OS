import { z } from "zod";

export const draftGenerationSchema = z.object({
  post: z.string().min(20),
  hooks: z.array(z.string()).length(3),
  ctas: z.array(z.string()).min(2).max(4),
  imageIdea: z.string().min(3),
});

export const draftGenerationMetaSchema = z.object({
  hooks: z.array(z.string()).length(3),
  ctas: z.array(z.string()).min(2).max(4),
  imageIdea: z.string().min(3),
});

export type DraftGenerationPayload = z.infer<typeof draftGenerationSchema>;

export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const candidate = fence?.[1] ?? trimmed;
  try {
    return JSON.parse(candidate.trim()) as unknown;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1)) as unknown;
    }
    throw new Error("Could not parse JSON from model output");
  }
}
