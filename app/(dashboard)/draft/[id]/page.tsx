import { AppHeader } from "@/components/app-header";
import { DraftWorkspace } from "@/components/draft/draft-workspace";

export default function DraftPage({ params }: { params: { id: string } }) {
  return (
    <>
      <AppHeader title="Draft editor" breadcrumb="Compose" />
      <div className="page-x flex flex-1 flex-col pb-16 pt-2">
        <DraftWorkspace draftId={params.id} />
      </div>
    </>
  );
}
