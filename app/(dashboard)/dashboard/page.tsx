import { Suspense } from "react";

import { AppHeader } from "@/components/app-header";
import { DashboardTopicsSection } from "@/components/dashboard/dashboard-topics-section";
import { DashboardPageSkeleton } from "@/components/loading/dashboard-page-skeleton";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session!.user!.id;

  return (
    <>
      <AppHeader
        title="Dashboard"
        breadcrumb="Topic board"
        description="Ranked topics from your discovery sources. Generate drafts from anything worth your time."
      />
      <div className="page-x flex flex-1 flex-col pb-8 pt-4 sm:pt-6">
        <Suspense fallback={<DashboardPageSkeleton />}>
          <DashboardTopicsSection userId={userId} />
        </Suspense>
      </div>
    </>
  );
}
