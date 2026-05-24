import { TopicsDashboard } from "@/components/dashboard/topics-dashboard";
import { AppHeader } from "@/components/app-header";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import {
  fetchTrendsForDashboard,
  serializeDashboardTrend,
} from "@/lib/trends/list";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session!.user!.id;

  const trends = await fetchTrendsForDashboard(userId, 24);
  const serialized = trends.map(serializeDashboardTrend);

  const lastLog = await prisma.cronLog.findFirst({
    where: { userId },
    orderBy: { runAt: "desc" },
    select: {
      runAt: true,
      success: true,
      totalDiscovered: true,
    },
  });

  const lastDiscovery = lastLog
    ? {
        runAt: lastLog.runAt.toISOString(),
        success: lastLog.success,
        totalDiscovered: lastLog.totalDiscovered,
      }
    : null;

  return (
    <>
      <AppHeader title="Dashboard" breadcrumb="Today" />
      <div className="flex flex-1 flex-col px-8 pb-8 pt-2">
        <TopicsDashboard
          initialTrends={serialized}
          lastDiscovery={lastDiscovery}
        />
      </div>
    </>
  );
}
