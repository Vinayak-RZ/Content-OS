"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { DraftOpenBadge, DraftStatusBadge } from "@/components/ui/draft-status-badge";
import { Button } from "@/components/ui/button";
import { useAppRouter } from "@/lib/client/use-app-router";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";
import { cn } from "@/lib/utils";

export type DraftRow = {
  id: string;
  topicTitle: string;
  status: string;
  updatedAt: string;
  currentContent: string;
};

export function DraftsTable({
  drafts,
  onDeleted,
  showStatus = true,
}: {
  drafts: DraftRow[];
  onDeleted?: (id: string) => void;
  showStatus?: boolean;
}) {
  const router = useAppRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (
      !window.confirm(
        `Delete "${title}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      const result = await fetchJson<{ ok: boolean }>(`/api/draft/${id}`, {
        method: "DELETE",
      });
      if (!result.ok) throw new Error(result.error);
      toast("Draft deleted.", "success");
      onDeleted?.(id);
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Delete failed", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-subtle bg-card shadow-ambient">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="border-b border-subtle bg-muted/40 font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Topic</th>
              {showStatus ? (
                <th className="px-4 py-3 font-medium">Status</th>
              ) : null}
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
                  deletingId === d.id && "opacity-50",
                )}
                onClick={() => router.push(`/draft/${d.id}`)}
              >
                <td className="px-4 py-3 font-medium">{d.topicTitle}</td>
                {showStatus ? (
                  <td className="px-4 py-3">
                    <DraftStatusBadge status={d.status} />
                  </td>
                ) : null}
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(d.updatedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {d.currentContent.length} chars
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/draft/${d.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DraftOpenBadge />
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="size-8 px-2 text-muted-foreground hover:text-destructive"
                      disabled={deletingId === d.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(d.id, d.topicTitle);
                      }}
                      aria-label={`Delete ${d.topicTitle}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
