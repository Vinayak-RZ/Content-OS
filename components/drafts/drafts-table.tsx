"use client";

import Link from "next/link";

import { DraftOpenBadge, DraftStatusBadge } from "@/components/ui/draft-status-badge";
import { useAppRouter } from "@/lib/client/use-app-router";
import { cn } from "@/lib/utils";

type DraftRow = {
  id: string;
  topicTitle: string;
  status: string;
  updatedAt: string;
  currentContent: string;
};

export function DraftsTable({ drafts }: { drafts: DraftRow[] }) {
  const router = useAppRouter();

  return (
    <div className="overflow-hidden rounded-xl border border-subtle bg-card shadow-ambient">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
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
                className={cn(
                  "cursor-pointer border-b border-border/50 transition-colors last:border-0",
                  "hover:bg-muted/30 active:bg-muted/40",
                )}
                onClick={() => router.push(`/draft/${d.id}`)}
              >
                <td className="px-4 py-3 font-medium">{d.topicTitle}</td>
                <td className="px-4 py-3">
                  <DraftStatusBadge status={d.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(d.updatedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {d.currentContent.length} chars
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/draft/${d.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DraftOpenBadge />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
