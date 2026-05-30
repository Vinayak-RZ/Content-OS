import { AppHeader } from "@/components/app-header";
import { AnalyticsPageSkeleton } from "@/components/loading/analytics-page-skeleton";

export default function AnalyticsLoading() {
  return (
    <>
      <AppHeader
        title="Analytics"
        breadcrumb="Insights"
        description="Published output and discovery activity for your account."
      />
      <AnalyticsPageSkeleton />
    </>
  );
}
