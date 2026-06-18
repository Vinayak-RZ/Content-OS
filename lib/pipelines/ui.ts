import type { ContentPipeline } from "@/lib/pipelines/types";

export type PipelineUiConfig = {
  headerTitle: string;
  runButtonLabel: string;
  runningLabel: string;
  emptyDescription: string;
  poolHint: string;
  showBlogBanner: boolean;
  customTopicMode: "url" | "text";
  knowledgeEmptyCta: string;
};

export const PIPELINE_UI: Record<ContentPipeline, PipelineUiConfig> = {
  signals: {
    headerTitle: "Today's signals",
    runButtonLabel: "Run discovery",
    runningLabel: "Running discovery…",
    emptyDescription:
      "Run discovery or paste a custom URL below. Seed Knowledge files first so ranking + drafts sound like you.",
    poolHint: "Each run researches new topics from HN, RSS, Reddit, GitHub, web search, and X.",
    showBlogBanner: true,
    customTopicMode: "url",
    knowledgeEmptyCta: "Fill Knowledge so ranking and drafts sound like you.",
  },
  studio: {
    headerTitle: "Story ideas for you",
    runButtonLabel: "Generate ideas",
    runningLabel: "Generating ideas…",
    emptyDescription:
      "Fill Studio knowledge (journey, ICP, platform) — then generate personal story ideas.",
    poolHint:
      "Ideas come from your Studio knowledge — journey, ICP, and platform context — not the news.",
    showBlogBanner: false,
    customTopicMode: "text",
    knowledgeEmptyCta: "Import Studio templates in Knowledge first.",
  },
};
