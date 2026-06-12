"use client";

import { ChevronDown, ChevronUp, Radar } from "lucide-react";
import { useState } from "react";

import type { ResearchDayGroup } from "@/lib/research/list-runs";
import { cn } from "@/lib/utils";

function RunCard({ run }: { run: ResearchDayGroup["runs"][number] }) {
  const [open, setOpen] = useState(true);
  const time = new Date(run.runAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="rounded-xl border border-subtle bg-card shadow-ambient">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5"
      >
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">
            {time} · {run.newStored} new
            {run.carriedOver > 0 ? ` · ${run.carriedOver} carried` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            {(run.durationMs / 1000).toFixed(1)}s · {run.topics.length} topics
            in snapshot
          </p>
        </div>
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      <div
        className={cn(
          "grid border-t border-subtle transition-[grid-template-rows]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <ul className="divide-y divide-border/50 px-4 py-2 sm:px-5">
            {run.topics.map((topic) => (
              <li
                key={topic.id}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug text-foreground">
                    {topic.topicTitle}
                  </p>
                  {topic.source ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {topic.source}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="rounded-full bg-brand-muted px-2 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wide text-brand">
                    {topic.role === "new" ? "New" : "Carried"}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {topic.finalScore.toFixed(1)}/10
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export function ResearchHistory({ days }: { days: ResearchDayGroup[] }) {
  if (days.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-subtle bg-muted/30 px-6 py-16 text-center">
        <Radar className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-4 font-heading text-base font-semibold text-foreground">
          No research runs yet
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Run discovery from the dashboard. Each run is saved here with the
          topics found that day.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {days.map((day) => (
        <section key={day.dateKey}>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {day.dateLabel}
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {day.runs.map((run) => (
              <RunCard key={run.id} run={run} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
