import { AppHeader } from "@/components/app-header";
import { ImproveDashboard } from "@/components/improve/improve-dashboard";
import { getAppAccess } from "@/lib/app-access";
import { getLatestImprovementRun } from "@/lib/improvement/run";

export default async function ImprovePage() {
  const access = await getAppAccess();
  if (!access || access.mode !== "user") {
    return null;
  }

  const latestRun = await getLatestImprovementRun(access.userId);
  const lastRunHint = latestRun?.completedAt
    ? `Last run: ${latestRun.completedAt.toLocaleString()}`
    : "Run your first improvement cycle to start learning from post performance.";

  return (
    <>
      <AppHeader
        title="Improve"
        breadcrumb="Self-improving engine"
        description={`Learn from post performance, research LinkedIn trends, and auto-update insight files. ${lastRunHint}`}
      />
      <div className="page-x flex flex-1 flex-col pb-8 pt-4 sm:pt-6">
        <ImproveDashboard />
      </div>
    </>
  );
}
