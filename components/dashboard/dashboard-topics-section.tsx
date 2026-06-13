import { hasEncryptedSecret } from "@/lib/crypto";
import { listRecentBlogs } from "@/lib/blogs/list";
import { prisma } from "@/lib/db";
import { DASHBOARD_POOL_FETCH_LIMIT } from "@/lib/discovery/founder-profile";
import { userHasFilledKnowledge } from "@/lib/knowledge/is-filled";
import {
  fetchDashboardTrendsBundle,
  serializeDashboardTrend,
} from "@/lib/trends/list";

import { TopicsDashboard } from "@/components/dashboard/topics-dashboard";

export async function DashboardTopicsSection({
  userId,
}: {
  userId: string;
}) {
  const [
    { trends, visiblePoolCount },
    latestBatchRow,
    knowledgeFilled,
    userKeys,
    lastLog,
    draftCount,
    recentBlogs,
  ] = await Promise.all([
    fetchDashboardTrendsBundle(userId, DASHBOARD_POOL_FETCH_LIMIT),
    prisma.trend.findFirst({
      where: { userId, discoveryBatchId: { not: null } },
      orderBy: { discoveredAt: "desc" },
      select: { discoveryBatchId: true },
    }),
    userHasFilledKnowledge(userId),
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
    prisma.cronLog.findFirst({
      where: { userId },
      orderBy: { runAt: "desc" },
      select: {
        runAt: true,
        success: true,
        totalDiscovered: true,
      },
    }),
    prisma.draft.count({ where: { userId } }),
    listRecentBlogs(userId, 8),
  ]);

  const serialized = trends.map(serializeDashboardTrend);
  const latestBatchId = latestBatchRow?.discoveryBatchId ?? null;

  const lastDiscovery = lastLog
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
    <TopicsDashboard
      initialTrends={serialized}
      lastDiscovery={lastDiscovery}
      visiblePoolCount={visiblePoolCount}
      latestBatchId={latestBatchId}
      showKnowledgeBanner={!knowledgeFilled}
      showTavilyBanner={!hasEncryptedSecret(userKeys?.tavilyApiKey)}
      showFirstRunChecklist={!knowledgeFilled && draftCount === 0}
      knowledgeFilled={knowledgeFilled}
      draftCount={draftCount}
      hasDiscoveryKey={
        hasEncryptedSecret(userKeys?.tavilyApiKey) ||
        hasEncryptedSecret(userKeys?.firecrawlApiKey)
      }
      hasAnyDraftKey={hasAnyDraftKey}
      recentBlogs={recentBlogs}
      hasTavilyKey={hasEncryptedSecret(userKeys?.tavilyApiKey)}
      hasFirecrawlKey={hasEncryptedSecret(userKeys?.firecrawlApiKey)}
    />
  );
}
