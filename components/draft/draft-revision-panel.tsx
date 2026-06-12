"use client";

import { History, RotateCcw } from "lucide-react";

import type { DraftRevisionEntry } from "@/lib/drafts/revision";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DraftRevisionPanel({
  revisions,
  currentContent,
  disabled,
  onRestore,
}: {
  revisions: DraftRevisionEntry[];
  currentContent: string;
  disabled?: boolean;
  onRestore: (revisionId: string) => void;
}) {
  if (revisions.length === 0) return null;

  const chronological = [...revisions].reverse();

  return (
    <Card className="shadow-pill">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-brand" />
          <CardTitle className="text-base">Version history</CardTitle>
        </div>
        <CardDescription>
          Restore a previous version of the LinkedIn body. AI edits are saved
          before each change.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {chronological.map((rev) => {
          const isCurrent = rev.content === currentContent;
          return (
            <div
              key={rev.id}
              className={cn(
                "flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5",
                isCurrent
                  ? "border-brand/40 bg-brand/5"
                  : "border-border/70 bg-card/80",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {rev.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(rev.at).toLocaleString()} · {rev.content.length}{" "}
                  chars
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {rev.content}
                </p>
              </div>
              {!isCurrent ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={disabled}
                  className="shrink-0 gap-1"
                  onClick={() => onRestore(rev.id)}
                >
                  <RotateCcw className="size-3.5" />
                  Restore
                </Button>
              ) : (
                <span className="shrink-0 text-xs font-medium text-brand">
                  Current
                </span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
