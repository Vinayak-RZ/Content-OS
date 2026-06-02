import { Suspense } from "react";

import { AppHeader } from "@/components/app-header";
import { DashboardTopicsSection } from "@/components/dashboard/dashboard-topics-section";
import { GuestTopicsDashboard } from "@/components/dashboard/guest-topics-dashboard";
import { DashboardPageSkeleton } from "@/components/loading/dashboard-page-skeleton";
import { getAppAccess } from "@/lib/app-access";

export default async function DashboardPage() {
  const access = await getAppAccess();

  if (access?.mode === "guest") {
    return (
      <>
        <AppHeader
          title="Dashboard"
          breadcrumb="Topic board"
          description="Try discovery without an account. Sign in when you're ready to save topics, knowledge, and drafts."
        />
        <div className="page-x flex flex-1 flex-col pb-8 pt-4 sm:pt-6">
          <GuestTopicsDashboard />
        </div>
      </>
    );
  }

  if (!access || access.mode !== "user") {
    return null;
  }
  const userId = access.userId;

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
