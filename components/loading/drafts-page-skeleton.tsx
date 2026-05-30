import { Skeleton } from "@/components/ui/skeleton";

function TableRowSkeleton() {
  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-full max-w-[220px]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-16 rounded-md" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="px-4 py-3 text-right">
        <Skeleton className="ml-auto h-6 w-14 rounded-md" />
      </td>
    </tr>
  );
}

export function DraftsPageSkeleton() {
  return (
    <div className="page-x flex flex-1 flex-col gap-6 pb-16 pt-4 sm:pt-6">
      <div className="overflow-hidden rounded-xl border border-subtle bg-card shadow-ambient">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="border-b border-subtle bg-muted/40">
              <tr>
                {["Topic", "Status", "Updated", "Length", ""].map((label) => (
                  <th key={label || "action"} className="px-4 py-3">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
