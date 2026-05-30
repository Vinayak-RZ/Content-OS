import { Skeleton } from "@/components/ui/skeleton";

function SettingsCardSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="rounded-xl border border-subtle bg-card shadow-ambient">
      <div className="border-b border-subtle px-6 py-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="space-y-4 px-6 py-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="page-x space-y-6 pb-16">
      <SettingsCardSkeleton fields={2} />
      <SettingsCardSkeleton fields={4} />
      <SettingsCardSkeleton fields={3} />
      <div className="rounded-xl border border-subtle bg-card p-6 shadow-ambient">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-full max-w-lg" />
        <Skeleton className="mt-4 h-24 w-full" />
        <Skeleton className="mt-4 h-10 w-28" />
      </div>
    </div>
  );
}
