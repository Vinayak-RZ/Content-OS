"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Getting started</CardTitle>
        <CardDescription>
          {completed} of {steps.length} complete - follow these steps to go
          from empty board to a draft in your voice.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
    </Card>
  );
}
