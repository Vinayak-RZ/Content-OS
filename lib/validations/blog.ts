import { z } from "zod";

import { READ_TIME_OPTIONS } from "@/lib/blogs/read-time";

const blogSourceTextSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1).max(240),
  excerpt: z.string().max(8000),
  source: z.enum(["firecrawl", "tavily", "manual"]),
});

export const blogResearchBodySchema = z.object({
  title: z.string().min(1).max(240),
  seedUrls: z.array(z.string().url()).max(10).default([]),
});

export const blogGenerateBodySchema = z.object({
  title: z.string().min(1).max(240),
  sourceTexts: z.array(blogSourceTextSchema).max(10).default([]),
  readTimeMinutes: z
    .number()
    .int()
    .refine((n) => (READ_TIME_OPTIONS as readonly number[]).includes(n), {
      message: "Invalid read time option",
    }),
  stream: z.boolean().optional(),
});

export const blogPatchBodySchema = z.object({
  title: z.string().min(1).max(240).optional(),
  currentContent: z.string().max(100_000).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export type BlogResearchBody = z.infer<typeof blogResearchBodySchema>;
export type BlogGenerateBody = z.infer<typeof blogGenerateBodySchema>;
export type BlogPatchBody = z.infer<typeof blogPatchBodySchema>;
