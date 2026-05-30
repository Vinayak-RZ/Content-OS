import { Skeleton } from "@/components/ui/skeleton";

function TopicCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-subtle bg-card p-5 shadow-ambient">
      <div className="mb-4 flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="mb-2 h-5 w-full" />
      <Skeleton className="mb-4 h-5 w-4/5" />
      <Skeleton className="mt-auto h-4 w-24" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="page-x flex flex-1 flex-col gap-8 pb-8 pt-4 sm:gap-10 sm:pt-6">
      <section className="rounded-xl border border-subtle bg-card px-4 py-5 shadow-ambient sm:px-6 sm:py-6">
        <Skeleton className="mb-2 h-7 w-40" />
        <Skeleton className="mb-1 h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-3/4 max-w-sm" />
        <Skeleton className="mt-4 h-10 w-36" />
      </section>

      <section>
        <Skeleton className="mb-4 h-4 w-24" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <TopicCardSkeleton />
          <TopicCardSkeleton />
          <TopicCardSkeleton />
        </div>
      </section>

      <section className="rounded-xl border border-subtle bg-card p-4 sm:p-6">
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>
    </div>
  );
}
