import type { BlogPost } from "@prisma/client";

import {
  countWords,
  estimateReadTimeMinutes,
} from "@/lib/blogs/read-time";
import type { BlogSourceText, SerializedBlogPost, SerializedBlogSummary } from "@/lib/blogs/types";

function parseSourceType(value: unknown): BlogSourceText["source"] {
  return value === "firecrawl" || value === "tavily" || value === "manual"
    ? value
    : "manual";
}

function parseSourceTexts(raw: unknown): BlogSourceText[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Record<string, unknown> => x !== null && typeof x === "object")
    .map((x) => ({
      url: typeof x.url === "string" ? x.url : "",
      title: typeof x.title === "string" ? x.title : "Untitled",
      excerpt: typeof x.excerpt === "string" ? x.excerpt : "",
      source: parseSourceType(x.source),
    }))
    .filter((x) => x.url.length > 0);
}

export function serializeBlogPost(row: BlogPost): SerializedBlogPost {
  const wordCount = countWords(row.currentContent);
  return {
    id: row.id,
    title: row.title,
    currentContent: row.currentContent,
    sources: row.sources,
    sourceTexts: parseSourceTexts(row.sourceTexts),
    readTimeMinutes: row.readTimeMinutes,
    status: row.status,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    wordCount,
    estimatedReadMinutes: estimateReadTimeMinutes(wordCount),
  };
}

export function serializeBlogSummary(row: BlogPost): SerializedBlogSummary {
  const wordCount = countWords(row.currentContent);
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    readTimeMinutes: row.readTimeMinutes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    wordCount,
    estimatedReadMinutes: estimateReadTimeMinutes(wordCount),
  };
}
