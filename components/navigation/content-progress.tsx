import { cn } from "@/lib/utils";

type ContentProgressProps = {
  label?: string;
  className?: string;
};

/** Centered indeterminate bar for route loading (not a top-of-page strip). */
export function ContentProgress({
  label = "Loading",
  className,
}: ContentProgressProps) {
  return (
    <div
      className={cn("flex flex-col items-center gap-3 py-2", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="font-heading text-sm font-medium text-muted-foreground">
        {label}
      </p>
      <div className="h-1 w-[min(12rem,70vw)] overflow-hidden rounded-full bg-muted">
        <div className="route-progress-bar h-full w-2/5 rounded-full bg-brand" />
      </div>
    </div>
  );
}
