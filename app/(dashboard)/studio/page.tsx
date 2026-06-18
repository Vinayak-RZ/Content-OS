import { Suspense } from "react";

import { AppHeader } from "@/components/app-header";
import { PipelineTopicsSection } from "@/components/dashboard/pipeline-topics-section";
import { DashboardPageSkeleton } from "@/components/loading/dashboard-page-skeleton";
import { getAppAccess } from "@/lib/app-access";

export default async function StudioPage() {
  const access = await getAppAccess();

  if (!access || access.mode !== "user") {
    return null;
  }

  return (
    <>
      <AppHeader
        title="Studio"
        breadcrumb="Story ideas"
        description="Personal content about your journey, startup, and ICP — sourced from your Knowledge, not the news."
      />
      <div className="page-x flex flex-1 flex-col pb-8 pt-4 sm:pt-6">
        <Suspense fallback={<DashboardPageSkeleton />}>
          <PipelineTopicsSection userId={access.userId} pipeline="studio" />
        </Suspense>
      </div>
    </>
  );
}
