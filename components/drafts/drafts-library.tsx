"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { DraftsTable, type DraftRow } from "@/components/drafts/drafts-table";
import { cn } from "@/lib/utils";

export function DraftsLibrary({ initialDrafts }: { initialDrafts: DraftRow[] }) {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [publishedOpen, setPublishedOpen] = useState(false);

  const activeDrafts = useMemo(
    () => drafts.filter((d) => d.status !== "published"),
    [drafts],
  );
  const publishedDrafts = useMemo(
    () => drafts.filter((d) => d.status === "published"),
    [drafts],
  );

  function handleDeleted(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="flex flex-col gap-8">
      {activeDrafts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-subtle bg-muted/30 px-6 py-12 text-center">
          <p className="font-heading text-base font-semibold text-foreground">
            No active drafts
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Published posts live in the archive below. Generate a new draft from
            the dashboard.
          </p>
        </div>
      ) : (
        <DraftsTable drafts={activeDrafts} onDeleted={handleDeleted} />
      )}

      {publishedDrafts.length > 0 ? (
        <section>
          <button
            type="button"
            onClick={() => setPublishedOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-subtle bg-muted/30 px-4 py-3 text-left"
          >
            <div>
              <p className="font-heading text-sm font-semibold text-foreground">
                Published ({publishedDrafts.length})
              </p>
              <p className="text-xs text-muted-foreground">
                Posts you marked as published — collapsed by default
              </p>
            </div>
            {publishedOpen ? (
              <ChevronUp className="size-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-5 text-muted-foreground" />
            )}
          </button>
          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-200",
              publishedOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              <div className="pt-4">
                <DraftsTable
                  drafts={publishedDrafts}
                  onDeleted={handleDeleted}
                  showStatus={false}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
