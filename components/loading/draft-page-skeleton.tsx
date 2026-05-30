import { Skeleton } from "@/components/ui/skeleton";

export function DraftPageSkeleton() {
  return (
    <div className="page-x flex flex-1 flex-col gap-5 pb-16 pt-2 sm:gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>

      <div>
        <Skeleton className="mb-2 h-8 w-full max-w-lg" />
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="min-h-[min(50vh,420px)] w-full rounded-lg sm:min-h-[360px]" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="rounded-xl border border-subtle bg-card p-5 shadow-pill">
        <Skeleton className="mb-3 h-5 w-20" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}
