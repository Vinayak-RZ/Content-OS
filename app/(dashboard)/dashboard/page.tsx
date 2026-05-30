import { TopicsDashboard } from "@/components/dashboard/topics-dashboard";
import { AppHeader } from "@/components/app-header";
import { hasEncryptedSecret } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { userHasFilledKnowledge } from "@/lib/knowledge/is-filled";
import { getSession } from "@/lib/session";
import { DASHBOARD_POOL_FETCH_LIMIT } from "@/lib/discovery/founder-profile";
import {
  countVisibleTrendsForDashboard,
  fetchTrendsForDashboard,
  serializeDashboardTrend,
} from "@/lib/trends/list";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session!.user!.id;

  const [trends, visiblePoolCount, latestBatchRow, knowledgeFilled, userKeys, lastLog] =
    await Promise.all([
    fetchTrendsForDashboard(userId, DASHBOARD_POOL_FETCH_LIMIT),
    countVisibleTrendsForDashboard(userId),
    prisma.trend.findFirst({
      where: { userId, discoveryBatchId: { not: null } },
      orderBy: { discoveredAt: "desc" },
      select: { discoveryBatchId: true },
    }),
    userHasFilledKnowledge(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { tavilyApiKey: true },
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

  return (
    <>
      <AppHeader
        title="Dashboard"
        breadcrumb="Topic board"
        description="Ranked topics from your discovery sources. Generate drafts from anything worth your time."
      />
      <div className="page-x flex flex-1 flex-col pb-8 pt-4 sm:pt-6">
        <TopicsDashboard
          initialTrends={serialized}
          lastDiscovery={lastDiscovery}
          visiblePoolCount={visiblePoolCount}
          latestBatchId={latestBatchId}
          showKnowledgeBanner={!knowledgeFilled}
          showTavilyBanner={!hasEncryptedSecret(userKeys?.tavilyApiKey)}
        />
      </div>
    </>
  );
}
