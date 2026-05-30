import type { Draft, Trend } from "@prisma/client";

export type ClientDraftPayload = {
  id: string;
  topicTitle: string;
  currentContent: string;
  hookVariants: string[];
  ctaVariants: string[];
  selectedHook: number;
  selectedCta: number;
  status: string;
  sources: string[];
  trend: { url: string; title: string } | null;
};

type DraftWithTrend = Draft & {
  trend: Pick<Trend, "url" | "title"> | null;
};

export function serializeDraftForClient(draft: DraftWithTrend): ClientDraftPayload {
  return {
    id: draft.id,
    topicTitle: draft.topicTitle,
    currentContent: draft.currentContent,
    hookVariants: draft.hookVariants,
    ctaVariants: draft.ctaVariants,
    selectedHook: draft.selectedHook,
    selectedCta: draft.selectedCta,
    status: draft.status,
    sources: draft.sources,
    trend: draft.trend
      ? { url: draft.trend.url, title: draft.trend.title }
      : null,
  };
}
