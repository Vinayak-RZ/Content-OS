export type BlogSourceText = {
  url: string;
  title: string;
  excerpt: string;
  source: "firecrawl" | "tavily" | "manual";
};

export type SerializedBlogPost = {
  id: string;
  title: string;
  currentContent: string;
  sources: string[];
  sourceTexts: BlogSourceText[];
  readTimeMinutes: number;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  estimatedReadMinutes: number;
};

export type SerializedBlogSummary = Pick<
  SerializedBlogPost,
  | "id"
  | "title"
  | "status"
  | "readTimeMinutes"
  | "createdAt"
  | "updatedAt"
  | "wordCount"
  | "estimatedReadMinutes"
>;
