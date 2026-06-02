import { Suspense } from "react";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { DraftWorkspace } from "@/components/draft/draft-workspace";
import {
  GuestPreviewPage,
  GuestSignInOverlay,
} from "@/components/guest/guest-sign-in-overlay";
import { serializeDraftForClient } from "@/lib/drafts/serialize-for-client";
import { getAppAccess } from "@/lib/app-access";
import { getGuestDemoDraft } from "@/lib/guest/demo-data";
import { prisma } from "@/lib/db";

export default async function DraftPage({ params }: { params: { id: string } }) {
  const access = await getAppAccess();

  if (access?.mode === "guest") {
    const demo = getGuestDemoDraft(params.id);
    if (!demo) {
      notFound();
    }

    return (
      <GuestPreviewPage
        header={<AppHeader title="Draft editor" breadcrumb="Compose" />}
        overlay={
          <GuestSignInOverlay
            feature="the draft editor"
            description="Preview hooks, body, and variants. Sign in to generate and save edits."
            callbackUrl={`/draft/${params.id}`}
          >
            <div className="page-x pb-16 pt-2">
              <Suspense fallback={null}>
                <DraftWorkspace draftId={demo.id} initialDraft={demo} />
              </Suspense>
            </div>
          </GuestSignInOverlay>
        }
      />
    );
  }

  if (!access || access.mode !== "user") {
    notFound();
  }

  const draft = await prisma.draft.findFirst({
    where: { id: params.id, userId: access.userId },
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
