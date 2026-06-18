import { AppHeader } from "@/components/app-header";
import { DashboardPageSkeleton } from "@/components/loading/dashboard-page-skeleton";

export default function StudioLoading() {
  return (
    <>
      <AppHeader
        title="Studio"
        breadcrumb="Story ideas"
        description="Personal content about your journey, startup, and ICP — sourced from your Knowledge."
      />
      <DashboardPageSkeleton />
    </>
  );
}
