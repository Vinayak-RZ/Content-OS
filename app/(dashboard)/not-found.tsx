import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="page-x flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
      <h2 className="font-heading text-xl font-semibold">Page not found</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        This page doesn&apos;t exist in Content OS, or you may not have access
        to it.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-medium text-white shadow-pill"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
