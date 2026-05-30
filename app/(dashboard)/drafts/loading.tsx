import { AppHeader } from "@/components/app-header";
import { DraftsPageSkeleton } from "@/components/loading/drafts-page-skeleton";

export default function DraftsLoading() {
  return (
    <>
      <AppHeader
        title="Drafts"
        breadcrumb="Library"
        description="Everything you've generated. Open any draft to keep editing."
      />
      <DraftsPageSkeleton />
    </>
  );
}
