import { AppHeader } from "@/components/app-header";

export default function ImproveLoading() {
  return (
    <>
      <AppHeader
        title="Improve"
        breadcrumb="Self-improving engine"
        description="Loading…"
      />
      <div className="page-x flex flex-1 flex-col pb-8 pt-4 sm:pt-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 rounded-xl bg-muted/40" />
          <div className="h-64 rounded-xl bg-muted/40" />
        </div>
      </div>
    </>
  );
}
