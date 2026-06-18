const SOURCE_TYPE_LABELS: Record<string, string> = {
  hn: "HN",
  reddit: "Reddit",
  rss: "RSS",
  github: "GitHub",
  tavily: "Web",
  firecrawl: "Web",
  x: "X",
  studio: "Studio",
};

export function formatSourceType(sourceType: string): string {
  return SOURCE_TYPE_LABELS[sourceType] ?? sourceType;
}
