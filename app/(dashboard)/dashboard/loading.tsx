import { AppHeader } from "@/components/app-header";
import { DashboardPageSkeleton } from "@/components/loading/dashboard-page-skeleton";

export default function DashboardLoading() {
  return (
    <>
      <AppHeader
        title="Dashboard"
        breadcrumb="Topic board"
        description="Ranked topics from your discovery sources. Generate drafts from anything worth your time."
      />
      <DashboardPageSkeleton />
    </>
  );
}
