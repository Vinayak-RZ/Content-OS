/** Shared API types - expanded per phase. */
export type ApiError = {
  error: string;
  code: string;
  statusCode: number;
};

export type DraftStatus = "draft" | "approved" | "published";

export type SourceType =
  | "hn"
  | "github"
  | "tavily"
  | "firecrawl"
  | "rss"
  | "reddit";

export type TopicEngagementStatus = "selected" | "published";

/** Thumbs up = save for next day (carry-over). Thumbs down = dismiss. */
export type TrendFeedbackStatus = "saved" | "dismissed";
