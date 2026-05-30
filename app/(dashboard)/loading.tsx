import { AppHeader } from "@/components/app-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardGroupLoading() {
  return (
    <>
      <AppHeader title="Loading" breadcrumb="Workspace" />
      <div className="page-x flex flex-1 flex-col gap-6 pb-16 pt-4 sm:pt-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </>
  );
}
