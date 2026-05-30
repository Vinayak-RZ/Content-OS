"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-x flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <h2 className="font-heading text-xl font-semibold">
        Couldn&apos;t load this page
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Something went wrong while loading your workspace. Try again, or return
        to the dashboard.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-medium shadow-pill hover:bg-muted/60"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
