import { z } from "zod";

export const knowledgePutSchema = z
  .object({
    content: z.string().max(102400, "Content must be at most 100 KB"),
  })
  .strict();

export type KnowledgePutInput = z.infer<typeof knowledgePutSchema>;
