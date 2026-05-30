import { AppHeader } from "@/components/app-header";
import { DraftPageSkeleton } from "@/components/loading/draft-page-skeleton";

export default function DraftLoading() {
  return (
    <>
      <AppHeader title="Draft editor" breadcrumb="Compose" />
      <DraftPageSkeleton />
    </>
  );
}
