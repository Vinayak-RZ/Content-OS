import { z } from "zod";

export const studioTopicCategorySchema = z.enum([
  "founder_journey",
  "startup_update",
  "icp_value",
  "lesson_learned",
  "behind_the_scenes",
]);

export const studioTopicIdeaSchema = z.object({
  title: z.string().min(8).max(240),
  summary: z.string().min(20).max(1200),
  angle: z.string().min(8).max(400),
  suggestedHook: z.string().min(8).max(280),
  category: studioTopicCategorySchema,
});

export const studioTopicsResponseSchema = z.object({
  topics: z.array(studioTopicIdeaSchema).min(4).max(14),
});

export type StudioTopicIdea = z.infer<typeof studioTopicIdeaSchema>;
