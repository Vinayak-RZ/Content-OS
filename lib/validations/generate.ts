import { z } from "zod";

export const generateDraftBodySchema = z
  .object({
    trendId: z.string().uuid().optional(),
    customTopic: z
      .object({
        title: z.string().min(1).max(240),
        summary: z.string().max(8000).optional(),
        url: z.string().url().optional(),
      })
      .optional(),
    stream: z.boolean().optional(),
  })
  .refine(
    (b) =>
      (b.trendId != null && b.customTopic == null) ||
      (b.trendId == null && b.customTopic != null),
    { message: "Provide exactly one of trendId or customTopic" },
  );

export type GenerateDraftBody = z.infer<typeof generateDraftBodySchema>;
