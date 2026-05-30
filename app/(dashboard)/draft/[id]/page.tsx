import { Suspense } from "react";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { DraftWorkspace } from "@/components/draft/draft-workspace";
import { serializeDraftForClient } from "@/lib/drafts/serialize-for-client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function DraftPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user?.id) {
    notFound();
  }

  const draft = await prisma.draft.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      trend: {
        select: { url: true, title: true },
      },
    },
  });

  if (!draft) {
    notFound();
  }

  return (
    <>
      <AppHeader title="Draft editor" breadcrumb="Compose" />
      <div className="page-x flex flex-1 flex-col pb-16 pt-2">
        <Suspense fallback={null}>
          <DraftWorkspace
            draftId={params.id}
            initialDraft={serializeDraftForClient(draft)}
          />
        </Suspense>
      </div>
    </>
  );
}
