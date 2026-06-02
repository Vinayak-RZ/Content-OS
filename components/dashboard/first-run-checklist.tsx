"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FirstRunChecklistProps = {
  knowledgeFilled: boolean;
  draftCount: number;
  hasDiscoveryKey: boolean;
  hasAnyDraftKey: boolean;
  trendCount: number;
};

export function FirstRunChecklist({
  knowledgeFilled,
  draftCount,
  hasDiscoveryKey,
  hasAnyDraftKey,
  trendCount,
}: FirstRunChecklistProps) {
  const [expanded, setExpanded] = useState(false);

  if (knowledgeFilled && draftCount > 0) return null;

  const steps = [
    {
      id: "keys",
      label: "Connect API keys",
      done: hasAnyDraftKey || hasDiscoveryKey,
      href: "/settings",
      cta: "Open settings",
    },
    {
      id: "knowledge",
      label: "Seed knowledge files",
      done: knowledgeFilled,
      href: "/knowledge",
      cta: "Start profile builder",
    },
    {
      id: "discovery",
      label: "Run discovery",
      done: trendCount > 0,
      href: "/dashboard#signals",
      cta: "Run discovery",
    },
    {
      id: "draft",
      label: "Generate your first draft",
      done: draftCount > 0,
      href: "/dashboard",
      cta: "Pick a topic",
    },
  ];

  const completed = steps.filter((s) => s.done).length;

  return (
    <Card className="border-brand/25 bg-brand/5 shadow-none">
      <CardHeader
        className={cn(
          "px-4 py-3 sm:px-5 sm:py-3.5",
          expanded ? "pb-0" : "pb-3",
        )}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-start justify-between gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">Getting started</CardTitle>
            <CardDescription className="mt-1">
              {completed} of {steps.length} complete
              {expanded
                ? " — follow these steps to go from empty board to a draft in your voice."
                : " — expand to see your setup steps."}
            </CardDescription>
          </div>
          <ChevronDown
            className={cn(
              "mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </CardHeader>
      {expanded ? (
        <CardContent className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-subtle bg-card/80 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {step.done ? (
                    <CheckCircle2
                      className="size-5 shrink-0 text-brand"
                      aria-hidden
                    />
                  ) : (
                    <Circle
                      className="size-5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  )}
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground">{index + 1}.</span>{" "}
                    {step.label}
                  </span>
                </div>
                {!step.done ? (
                  <Link
                    href={step.href}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-pill hover:bg-muted/60"
                  >
                    {step.cta}
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        </CardContent>
      ) : null}
    </Card>
  );
}
