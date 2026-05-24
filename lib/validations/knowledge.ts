import { z } from "zod";

import { KNOWLEDGE_ROLES } from "@/lib/knowledge/constants";

export const knowledgePutSchema = z
  .object({
    content: z.string().max(102400, "Content must be at most 100 KB"),
  })
  .strict();

export const knowledgeCreateSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(49)
      .regex(
        /^[a-z0-9][a-z0-9-]*$/,
        "Slug must be lowercase letters, numbers, and hyphens",
      ),
    displayName: z.string().min(1).max(120),
    role: z.enum(KNOWLEDGE_ROLES),
    content: z.string().max(102400).optional(),
    template: z.enum(["linkedin-profile"]).optional(),
  })
  .strict();

export type KnowledgePutInput = z.infer<typeof knowledgePutSchema>;
export type KnowledgeCreateInput = z.infer<typeof knowledgeCreateSchema>;
