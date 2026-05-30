import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { DraftsTable } from "@/components/drafts/drafts-table";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function DraftsLibraryPage() {
  const session = await getSession();
  const userId = session!.user!.id;

  const drafts = await prisma.draft.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      topicTitle: true,
      status: true,
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
        description="Everything you've generated. Open any draft to keep editing."
      />
      <div className="page-x flex flex-1 flex-col gap-6 pb-16 pt-4 sm:pt-6">
        {drafts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-subtle bg-muted/30 px-6 py-16 text-center">
            <p className="font-heading text-base font-semibold text-foreground">
              No drafts yet
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Pick a topic on the dashboard and generate your first draft.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-medium text-white shadow-pill"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <DraftsTable drafts={initialDrafts} />
        )}
      </div>
    </>
  );
}
