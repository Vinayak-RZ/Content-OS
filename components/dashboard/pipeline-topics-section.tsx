import { hasEncryptedSecret } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { DASHBOARD_POOL_FETCH_LIMIT } from "@/lib/discovery/founder-profile";
import { userHasFilledKnowledge } from "@/lib/knowledge/is-filled";
import { userHasStudioKnowledge } from "@/lib/knowledge/studio-ready";
import type { ContentPipeline } from "@/lib/pipelines/types";
import {
  fetchDashboardTrendsBundle,
  serializeDashboardTrend,
} from "@/lib/trends/list";

import { PipelineTopicsDashboard } from "@/components/dashboard/pipeline-topics-dashboard";

export async function PipelineTopicsSection({
  userId,
  pipeline,
}: {
  userId: string;
  pipeline: ContentPipeline;
}) {
  const [
    { trends, visiblePoolCount },
    latestBatchRow,
    knowledgeFilled,
    studioReady,
    userKeys,
    lastLog,
    draftCount,
  ] = await Promise.all([
    fetchDashboardTrendsBundle(userId, DASHBOARD_POOL_FETCH_LIMIT, pipeline),
    prisma.trend.findFirst({
      where: { userId, pipeline, discoveryBatchId: { not: null } },
      orderBy: { discoveredAt: "desc" },
      select: { discoveryBatchId: true },
    }),
    userHasFilledKnowledge(userId),
    userHasStudioKnowledge(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        tavilyApiKey: true,
        firecrawlApiKey: true,
        openrouterKey: true,
        nvidiaKey: true,
        openaiKey: true,
      },
    }),
    prisma.discoveryRun.findFirst({
      where: { userId, pipeline },
      orderBy: { runAt: "desc" },
      select: {
        runAt: true,
        success: true,
        totalDiscovered: true,
      },
    }),
    prisma.draft.count({ where: { userId } }),
  ]);

  const serialized = trends.map(serializeDashboardTrend);
  const latestBatchId = latestBatchRow?.discoveryBatchId ?? null;

  const lastRun = lastLog
    ? {
        runAt: lastLog.runAt.toISOString(),
        success: lastLog.success,
        totalDiscovered: lastLog.totalDiscovered,
      }
    : null;

  const hasAnyDraftKey =
    hasEncryptedSecret(userKeys?.openrouterKey) ||
    hasEncryptedSecret(userKeys?.nvidiaKey) ||
    hasEncryptedSecret(userKeys?.openaiKey);

  return (
    <PipelineTopicsDashboard
      pipeline={pipeline}
      initialTrends={serialized}
      lastRun={lastRun}
      visiblePoolCount={visiblePoolCount}
      latestBatchId={latestBatchId}
      showKnowledgeBanner={
        pipeline === "studio" ? !studioReady : !knowledgeFilled
      }
      showTavilyBanner={
        pipeline === "signals" && !hasEncryptedSecret(userKeys?.tavilyApiKey)
      }
      showFirstRunChecklist={
        pipeline === "signals" && !knowledgeFilled && draftCount === 0
      }
      knowledgeFilled={pipeline === "studio" ? studioReady : knowledgeFilled}
      draftCount={draftCount}
      hasDiscoveryKey={
        pipeline === "studio"
          ? hasAnyDraftKey
          : hasEncryptedSecret(userKeys?.tavilyApiKey) ||
            hasEncryptedSecret(userKeys?.firecrawlApiKey)
      }
      hasAnyDraftKey={hasAnyDraftKey}
    />
  );
}
