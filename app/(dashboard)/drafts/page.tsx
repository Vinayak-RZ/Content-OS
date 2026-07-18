import { AppHeader } from "@/components/app-header";
import { CreateDraftForm } from "@/components/drafts/create-draft-form";
import { DraftsLibrary } from "@/components/drafts/drafts-library";
import { DraftsTable } from "@/components/drafts/drafts-table";
import {
  GuestPreviewPage,
  GuestSignInOverlay,
} from "@/components/guest/guest-sign-in-overlay";
import { getAppAccess } from "@/lib/app-access";
import { GUEST_DEMO_DRAFTS } from "@/lib/guest/demo-data";
import { prisma } from "@/lib/db";

export default async function DraftsLibraryPage() {
  const access = await getAppAccess();
  const isGuest = access?.mode === "guest";

  if (isGuest) {
    return (
      <GuestPreviewPage
        header={
          <AppHeader
            title="Drafts"
            breadcrumb="Library"
            description="Everything you've generated. Open any draft to keep editing."
          />
        }
        overlay={
          <GuestSignInOverlay
            feature="Drafts"
            description="Preview your drafts library. Sign in to generate, edit, and publish from real topics."
          >
            <div className="page-x flex flex-col gap-6 pb-16 pt-4 sm:pt-6">
              <DraftsTable drafts={GUEST_DEMO_DRAFTS} />
            </div>
          </GuestSignInOverlay>
        }
      />
    );
  }

  if (!access || access.mode !== "user") {
    return null;
  }
  const userId = access.userId;

  const drafts = await prisma.draft.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      topicTitle: true,
      status: true,
      pipeline: true,
      updatedAt: true,
      currentContent: true,
    },
  });

  const initialDrafts = drafts.map((d) => ({
    ...d,
    updatedAt: d.updatedAt.toISOString(),
  }));

  return (
    <>
      <AppHeader
        title="Drafts"
        breadcrumb="Library"
        description="Create drafts from scratch or from Signals and Studio. Edit, publish, and archive here."
      />
      <div className="page-x flex flex-1 flex-col gap-6 pb-16 pt-4 sm:pt-6">
        {drafts.length === 0 ? (
          <div className="flex flex-col gap-8">
            <CreateDraftForm defaultExpanded />
            <div className="rounded-xl border border-dashed border-subtle bg-muted/30 px-6 py-12 text-center">
              <p className="font-heading text-base font-semibold text-foreground">
                No drafts yet
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Create a blank draft above, or generate one from Signals or
                Studio.
              </p>
            </div>
          </div>
        ) : (
          <DraftsLibrary initialDrafts={initialDrafts} />
        )}
      </div>
    </>
  );
}
