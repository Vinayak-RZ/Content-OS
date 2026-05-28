"use client";

import { TopicDraftButton } from "@/components/dashboard/topic-draft-button";
import { TopicRemoveButton } from "@/components/dashboard/topic-remove-button";
import { Badge } from "@/components/ui/badge";
import type { SerializedDashboardTrend } from "@/lib/trends/list";
import { formatSourceType } from "@/lib/discovery/source-labels";

type TopicPoolTableProps = {
  trends: SerializedDashboardTrend[];
  latestBatchId: string | null;
};

function score10(finalScore: number): string {
  return (finalScore * 10).toFixed(2);
}

export function TopicPoolTable({ trends, latestBatchId }: TopicPoolTableProps) {
  if (trends.length === 0) return null;

  return (
    <section className="rounded-xl border border-subtle bg-card shadow-ambient">
      <div className="border-b border-subtle px-6 py-4">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Full topic pool ({trends.length})
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          All active topics without a recent draft. Generate from any row or
          remove topics you will not use.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-subtle font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Final /10</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Pool</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trends.map((t, i) => {
              const isNew =
                latestBatchId != null && t.discoveryBatchId === latestBatchId;
              return (
                <tr
                  key={t.id}
                  className="border-b border-subtle/60 last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">
                    {score10(t.finalScore)}
                  </td>
                  <td className="max-w-md px-4 py-3">
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground hover:text-brand hover:underline"
                    >
                      {t.title.length > 72 ? `${t.title.slice(0, 72)}…` : t.title}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatSourceType(t.sourceType)}
                  </td>
                  <td className="px-4 py-3">
                    {isNew ? (
                      <Badge variant="brand" className="rounded-full text-[10px]">
                        New
                      </Badge>
                    ) : t.feedbackStatus === "saved" ? (
                      <Badge variant="muted" className="rounded-full text-[10px]">
                        Saved
                      </Badge>
                    ) : (
                      <Badge variant="muted" className="rounded-full text-[10px]">
                        Backlog
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <TopicDraftButton trendId={t.id} size="sm" />
                      <TopicRemoveButton trendId={t.id} size="sm" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
