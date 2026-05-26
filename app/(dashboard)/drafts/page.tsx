import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import {
  DraftOpenBadge,
  DraftStatusBadge,
} from "@/components/ui/draft-status-badge";
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

  return (
    <>
      <AppHeader
        title="Drafts"
        breadcrumb="Library"
        description="Everything you've generated. Open any draft to keep editing."
      />
      <div className="flex flex-1 flex-col gap-6 px-8 pb-16 pt-6">
        {drafts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-subtle bg-muted/30 px-6 py-16 text-center">
            <p className="font-heading text-base font-semibold text-foreground">
              No drafts yet
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Pick a topic on the dashboard and hit Generate draft to start
              your first piece.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-subtle bg-card shadow-ambient">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-subtle bg-muted/40 font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Topic</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium">Length</th>
                  <th className="px-4 py-3 font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium">{d.topicTitle}</td>
                    <td className="px-4 py-3">
                      <DraftStatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.updatedAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.currentContent.length} chars
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/draft/${d.id}`}>
                        <DraftOpenBadge />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
