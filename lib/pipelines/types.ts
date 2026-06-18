export const CONTENT_PIPELINES = ["signals", "studio"] as const;

export type ContentPipeline = (typeof CONTENT_PIPELINES)[number];

export function isContentPipeline(value: string): value is ContentPipeline {
  return (CONTENT_PIPELINES as readonly string[]).includes(value);
}
