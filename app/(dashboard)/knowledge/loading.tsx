import { AppHeader } from "@/components/app-header";
import { KnowledgePageSkeleton } from "@/components/loading/knowledge-page-skeleton";

export default function KnowledgeLoading() {
  return (
    <>
      <AppHeader
        title="Knowledge"
        breadcrumb="Workspace"
        description="Context files that ground discovery and draft generation in your voice."
      />
      <KnowledgePageSkeleton />
    </>
  );
}
