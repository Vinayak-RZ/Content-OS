"use client";

import { ContentProgress } from "@/components/navigation/content-progress";
import { useNavigationProgress } from "@/lib/client/navigation-progress";
import { cn } from "@/lib/utils";

export function RouteProgress() {
  const { isNavigating } = useNavigationProgress();

  if (!isNavigating) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[100] flex items-center justify-center",
        "bg-background/55 backdrop-blur-[1px]",
      )}
      aria-hidden
    >
      <div className="rounded-xl border border-subtle bg-card px-6 py-5 shadow-ambient">
        <ContentProgress label="Opening page" />
      </div>
    </div>
  );
}
