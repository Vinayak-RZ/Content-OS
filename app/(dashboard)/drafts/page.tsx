import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
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
      <AppHeader title="Drafts" breadcrumb="Library" />
      <div className="flex flex-1 flex-col gap-6 px-8 pb-16 pt-2">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Everything you&apos;ve generated — filter mentally by status badges; open to keep editing.
        </p>

        {drafts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/15 px-6 py-12 text-center text-sm text-muted-foreground">
            No drafts yet. Pick a topic on the dashboard and hit{" "}
            <strong className="text-foreground">Generate draft</strong>.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-pill">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-border/70 bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
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
                      <Badge variant="muted" className="capitalize">
                        {d.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.updatedAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.currentContent.length} chars
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/draft/${d.id}`}
                        className="text-sm font-medium text-brand underline-offset-4 hover:underline"
                      >
                        Open
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
