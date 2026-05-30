import { Skeleton } from "@/components/ui/skeleton";

export function KnowledgePageSkeleton() {
  return (
    <div className="page-x flex flex-1 flex-col gap-4 pb-8 pt-4 sm:gap-6 sm:pt-6">
      <div className="rounded-xl border border-subtle bg-card p-4 shadow-ambient sm:p-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <div className="flex min-h-[480px] flex-col overflow-hidden rounded-xl border border-subtle bg-card shadow-ambient lg:flex-row">
        <aside className="border-b border-subtle p-3 lg:w-64 lg:border-b-0 lg:border-r">
          <Skeleton className="mb-3 h-9 w-full" />
          <div className="space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
          <Skeleton className="min-h-[320px] flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
