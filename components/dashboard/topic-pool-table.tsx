"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { TopicDraftButton } from "@/components/dashboard/topic-draft-button";
import { TopicRemoveButton } from "@/components/dashboard/topic-remove-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DASHBOARD_TOP_TOPICS_LIMIT } from "@/lib/discovery/founder-profile";
import { formatSourceType } from "@/lib/discovery/source-labels";
import type { SerializedDashboardTrend } from "@/lib/trends/types";

type TopicPoolTableProps = {
  trends: SerializedDashboardTrend[];
  latestBatchId: string | null;
};

function score10(finalScore: number): string {
  return (finalScore * 10).toFixed(2);
}

export function TopicPoolTable({ trends, latestBatchId }: TopicPoolTableProps) {
  const [expanded, setExpanded] = useState(false);

  if (trends.length === 0) return null;

  const visibleTrends = expanded
    ? trends
    : trends.slice(0, DASHBOARD_TOP_TOPICS_LIMIT);
  const hasMore = trends.length > DASHBOARD_TOP_TOPICS_LIMIT;

  return (
    <section className="rounded-xl border border-subtle bg-card shadow-ambient">
      <div className="border-b border-subtle px-6 py-4">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Topic pool ({trends.length})
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ranked topics without a recent draft. Showing top{" "}
          {expanded ? trends.length : Math.min(DASHBOARD_TOP_TOPICS_LIMIT, trends.length)}
          {hasMore && !expanded ? ` of ${trends.length}` : ""}. Generate from any
          row or remove topics you will not use.
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
            {visibleTrends.map((t, i) => {
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
      {hasMore ? (
        <div className="flex justify-center border-t border-subtle px-6 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="size-4" />
                Show top {DASHBOARD_TOP_TOPICS_LIMIT}
              </>
            ) : (
              <>
                <ChevronDown className="size-4" />
                Show all {trends.length} topics
              </>
            )}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
