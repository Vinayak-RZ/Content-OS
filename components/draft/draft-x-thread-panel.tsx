"use client";

import { Copy, Loader2, MessagesSquare } from "lucide-react";
import { useState } from "react";

import { X_THREAD_MAX_CHARS } from "@/lib/generation/x-thread-prompts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/client/toast";
import { cn } from "@/lib/utils";

export function DraftXThreadPanel({
  parts,
  disabled,
  generating,
  defaultExpanded = false,
  onGenerate,
  onChange,
}: {
  parts: string[];
  disabled?: boolean;
  generating?: boolean;
  defaultExpanded?: boolean;
  onGenerate: () => void;
  onChange: (parts: string[]) => void;
}) {
  const [expanded, setExpanded] = useState(
    defaultExpanded || parts.length > 0,
  );

  async function copyThread() {
    if (parts.length === 0) return;
    const text = parts
      .map((t, i) => `${i + 1}/${parts.length}\n${t}`)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    toast("X thread copied.", "success");
  }

  return (
    <Card className="shadow-pill">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessagesSquare className="size-4 text-brand" />
            <CardTitle className="text-base">X thread</CardTitle>
          </div>
          <Button
            type="button"
            size="sm"
            variant="brandOutline"
            disabled={disabled || generating}
            className="gap-1"
            onClick={onGenerate}
          >
            {generating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            {parts.length > 0 ? "Regenerate" : "Generate from LinkedIn"}
          </Button>
        </div>
        <CardDescription>
          Repurpose your LinkedIn post into 2–3 tweets (&lt;{X_THREAD_MAX_CHARS}{" "}
          chars each). Tweet 1 includes hashtags; tone is punchier for X.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {parts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Finish your LinkedIn post, then generate an X thread with different
            wording and structure.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Collapse" : "Expand"} thread
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="gap-1"
                onClick={() => void copyThread()}
              >
                <Copy className="size-3.5" />
                Copy thread
              </Button>
            </div>
            {expanded
              ? parts.map((tweet, i) => (
                  <div key={i} className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Tweet {i + 1}
                        {i === 0 ? " · includes hashtags" : ""}
                      </span>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          tweet.length > X_THREAD_MAX_CHARS
                            ? "text-red-600"
                            : "text-muted-foreground",
                        )}
                      >
                        {tweet.length}/{X_THREAD_MAX_CHARS}
                      </span>
                    </div>
                    <Textarea
                      value={tweet}
                      disabled={disabled}
                      onChange={(e) => {
                        const next = [...parts];
                        next[i] = e.target.value;
                        onChange(next);
                      }}
                      className="min-h-[88px] text-sm leading-relaxed"
                    />
                  </div>
                ))
              : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
