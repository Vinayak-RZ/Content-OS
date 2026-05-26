"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopicDraftButton } from "@/components/dashboard/topic-draft-button";
import { TopicRemoveButton } from "@/components/dashboard/topic-remove-button";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SerializedDashboardTrend } from "@/lib/trends/list";

function domainLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host || "Source";
  } catch {
    return "Source";
  }
}

function clipSentences(text: string, max = 320): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const parts = clean.split(/(?<=[.!?])\s+/);
  let out = "";
  for (const p of parts) {
    if ((out + p).length > max) break;
    out += (out ? " " : "") + p;
  }
  return out.length > 0 ? out : clean.slice(0, max);
}

function scoreBadgeClass(score10: number): string {
  if (score10 >= 7.5) return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700";
  if (score10 >= 5) return "border-amber-500/40 bg-amber-500/10 text-amber-800";
  return "border-border bg-muted text-muted-foreground";
}

export function TopicCard({
  trend,
  className,
}: {
  trend: SerializedDashboardTrend;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const score10 = Math.min(10, Math.max(0, trend.finalScore * 10));

  async function patchFeedback(
    feedback: "saved" | "dismissed" | null,
  ): Promise<void> {
    setBusy(true);
    try {
      const res = await fetch(`/api/trends/${trend.id}/feedback`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      if (!res.ok) throw new Error("Feedback failed");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const tagHint =
    trend.tags.length > 0
      ? trend.tags.slice(0, 3).join(", ")
      : "your founder knowledge base";

  return (
    <Card
      className={`flex h-full flex-col border-border/70 shadow-pill ${className ?? ""}`}
    >
      <CardHeader className="shrink-0 gap-2 pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="max-w-[85%] text-lg font-semibold leading-snug">
            {trend.title.slice(0, 80)}
            {trend.title.length > 80 ? "…" : ""}
          </CardTitle>
          <Badge
            variant="default"
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreBadgeClass(score10)}`}
          >
            {score10.toFixed(1)}/10
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {trend.feedbackStatus === "saved" ? (
            <Badge variant="brand" className="rounded-full text-[10px]">
              Saved · carried
            </Badge>
          ) : null}
          <Badge variant="muted" className="rounded-full text-[10px] capitalize">
            {trend.sourceType}
          </Badge>
        </div>
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Why it matters: </span>
          {clipSentences(trend.summary, 280)}
        </CardDescription>
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Why it fits you: </span>
          Aligns with themes you track ({tagHint}) — grounded in your Knowledge
          files.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-2 pb-0 pt-0">
        <p className="text-sm text-foreground/90">
          <span className="font-medium">Suggested angle: </span>
          Lead with how this shifts incentives for technical founders building in{" "}
          {trend.tags[0] ?? "this space"}.
        </p>
        <a
          href={trend.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-brand underline-offset-4 hover:underline"
        >
          {domainLabel(trend.url)} · {trend.source}
        </a>
      </CardContent>
      <div className="shrink-0 border-t border-subtle px-6 pb-6 pt-3 sm:px-8 sm:pb-8">
        <div className="flex flex-wrap gap-2">
          <TopicDraftButton trendId={trend.id} className="gap-1.5" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void patchFeedback("saved")}
            aria-label="Save topic"
          >
            <ThumbsUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void patchFeedback("dismissed")}
            aria-label="Dismiss topic"
          >
            <ThumbsDown className="size-4" />
          </Button>
          <TopicRemoveButton trendId={trend.id} size="sm" />
        </div>
      </div>
    </Card>
  );
}
