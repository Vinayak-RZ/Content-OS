import { z } from "zod";

import { ALL_BUILDER_ANSWER_IDS } from "@/lib/knowledge/builder-questions";

const answerFields = Object.fromEntries(
  ALL_BUILDER_ANSWER_IDS.map((id) => [id, z.string().max(4000).optional()]),
) as Record<string, z.ZodOptional<z.ZodString>>;

export const knowledgeBuildSchema = z.object(answerFields).strict();

export type KnowledgeBuildInput = z.infer<typeof knowledgeBuildSchema>;
