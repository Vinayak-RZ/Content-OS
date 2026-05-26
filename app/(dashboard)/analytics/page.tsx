import Link from "next/link";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { PublicationChart } from "@/components/analytics/publication-chart";
import { DraftStatusBadge } from "@/components/ui/draft-status-badge";
import { fetchAnalyticsSummary } from "@/lib/analytics/summary";
import { getSession } from "@/lib/session";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <article className="rounded-xl border border-subtle bg-card p-6 shadow-ambient">
      <p className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </article>
  );
}

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const analytics = await fetchAnalyticsSummary(session.user.id);

  return (
    <>
      <AppHeader
        title="Analytics"
        breadcrumb="Insights"
        description="Published output and discovery activity for your account."
      />
      <div className="flex flex-1 flex-col gap-8 px-8 pb-16 pt-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Published posts"
            value={analytics.publishedCount}
            hint="Drafts marked as published"
          />
          <StatCard
            label="Published this week"
            value={analytics.publishedThisWeek}
            hint="Since Monday"
          />
          <StatCard
            label="Discovery runs"
            value={analytics.discoveryRunsTotal}
            hint="All time"
          />
          <StatCard
            label="Runs today"
            value={analytics.discoveryRunsToday}
            hint="Manual and scheduled"
          />
        </div>

        <section className="rounded-xl border border-subtle bg-card p-6 shadow-ambient sm:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-semibold">
                Posts published per day
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Last 14 days based on when you marked drafts as published.
              </p>
            </div>
            <p className="font-heading text-sm font-semibold text-brand">
              {analytics.publishedThisWeek} this week
            </p>
          </div>
          <PublicationChart data={analytics.publishedByDay} />
        </section>

        <section className="rounded-xl border border-subtle bg-card shadow-ambient">
          <div className="border-b border-subtle px-6 py-4 sm:px-8">
            <h2 className="font-heading text-lg font-semibold">
              Published drafts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Posts you have shipped from this account.
            </p>
          </div>
          {analytics.recentPublished.length === 0 ? (
            <div className="px-6 py-12 text-center sm:px-8">
              <p className="text-sm text-muted-foreground">
                No published posts yet. Mark a draft as published when it goes
                live.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-subtle">
              {analytics.recentPublished.map((draft) => (
                <li
                  key={draft.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 sm:px-8"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{draft.topicTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(draft.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DraftStatusBadge status="published" />
                    <Link
                      href={`/draft/${draft.id}`}
                      className="font-heading text-xs font-semibold text-brand hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
