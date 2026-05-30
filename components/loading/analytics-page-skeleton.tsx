import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <article className="rounded-xl border border-subtle bg-card p-4 shadow-ambient sm:p-6">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-16 sm:h-9" />
      <Skeleton className="mt-2 h-4 w-32" />
    </article>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="page-x flex flex-1 flex-col gap-6 pb-16 pt-4 sm:gap-8 sm:pt-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <section className="rounded-xl border border-subtle bg-card p-6 shadow-ambient sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex h-48 items-end gap-2 sm:h-56">
          {[40, 55, 35, 60, 45, 70, 50, 38, 62, 48, 58, 42, 65, 52].map(
            (h, i) => (
              <Skeleton
                key={i}
                className="w-full rounded-t-md"
                style={{ height: `${h}%` }}
              />
            ),
          )}
        </div>
      </section>

      <section className="rounded-xl border border-subtle bg-card shadow-ambient">
        <div className="border-b border-subtle px-6 py-4 sm:px-8">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <ul className="divide-y divide-subtle">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 sm:px-8"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-full max-w-xs" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-4 w-10" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
