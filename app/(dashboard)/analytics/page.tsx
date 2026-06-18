import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { BufferSyncButton } from "@/components/analytics/buffer-sync-button";
import { PublicationChart } from "@/components/analytics/publication-chart";
import { SocialPostTable } from "@/components/analytics/social-post-table";
import {
  GuestPreviewPage,
  GuestSignInOverlay,
} from "@/components/guest/guest-sign-in-overlay";
import { DraftStatusBadge } from "@/components/ui/draft-status-badge";
import { fetchAnalyticsSummary } from "@/lib/analytics/summary";
import type { AnalyticsSummary } from "@/lib/analytics/summary";
import {
  fetchBufferAnalyticsSummary,
  type BufferAnalyticsSummary,
} from "@/lib/analytics/buffer-summary";
import { getAppAccess } from "@/lib/app-access";
import { GUEST_DEMO_ANALYTICS } from "@/lib/guest/demo-data";

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
    <article className="rounded-xl border border-subtle bg-card p-4 shadow-ambient sm:p-6">
      <p className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-heading text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </article>
  );
}

function BufferAnalyticsSection({
  buffer,
}: {
  buffer: BufferAnalyticsSummary;
}) {
  return (
    <>
      <section className="rounded-xl border border-subtle bg-card p-6 shadow-ambient sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-semibold">
              Buffer post performance
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Impressions and engagement for sent LinkedIn and X posts synced
              from Buffer.
            </p>
          </div>
          <BufferSyncButton
            connected={buffer.connected}
            lastSyncAt={buffer.lastSyncAt}
          />
        </div>

        {buffer.lastSyncError ? (
          <p className="mb-4 text-sm text-red-600">{buffer.lastSyncError}</p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Synced posts"
            value={buffer.postCount}
            hint={`${buffer.channelCount} channel${buffer.channelCount === 1 ? "" : "s"}`}
          />
          <StatCard
            label="Impressions"
            value={buffer.totals.impressions.toLocaleString()}
            hint="Across recent synced posts"
          />
          <StatCard
            label="Reactions"
            value={buffer.totals.reactions.toLocaleString()}
          />
          <StatCard
            label="Comments"
            value={buffer.totals.comments.toLocaleString()}
          />
          <StatCard
            label="Avg engagement"
            value={
              buffer.totals.engagementRate != null
                ? `${buffer.totals.engagementRate.toFixed(1)}%`
                : "—"
            }
            hint="When reported by network"
          />
        </div>
      </section>

      <section className="rounded-xl border border-subtle bg-card shadow-ambient">
        <div className="border-b border-subtle px-6 py-4 sm:px-8">
          <h2 className="font-heading text-lg font-semibold">Buffer posts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Detailed metrics per post. Missing values mean the network has not
            reported them yet.
          </p>
        </div>
        <SocialPostTable posts={buffer.posts} />
      </section>
    </>
  );
}

function AnalyticsBody({
  analytics,
  buffer,
}: {
  analytics: AnalyticsSummary;
  buffer: BufferAnalyticsSummary | null;
}) {
  const chartData = buffer?.publishedByDay ?? [];
  const chartThisWeek = buffer?.publishedThisWeek ?? 0;
  const publishedCount = buffer?.postCount ?? analytics.publishedCount;
  const publishedThisWeek = buffer?.publishedThisWeek ?? analytics.publishedThisWeek;
  const publishedHint = buffer
    ? "Sent via Buffer (LinkedIn & X)"
    : "Connect Buffer in Settings";

  return (
    <div className="page-x flex flex-1 flex-col gap-6 pb-16 pt-4 sm:gap-8 sm:pt-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Published posts"
          value={publishedCount}
          hint={publishedHint}
        />
        <StatCard
          label="Published this week"
          value={publishedThisWeek}
          hint={buffer ? "Buffer sent posts since Monday" : "Since Monday"}
        />
        <StatCard
          label="Discovery runs"
          value={analytics.discoveryRunsTotal}
          hint="All time"
        />
        <StatCard
          label="Runs today"
          value={analytics.discoveryRunsToday}
          hint="Manual runs only"
        />
      </div>

      {buffer ? <BufferAnalyticsSection buffer={buffer} /> : null}

      <section className="rounded-xl border border-subtle bg-card p-6 shadow-ambient sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-semibold">
              Posts published per day
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {buffer
                ? "Last 14 days of sent LinkedIn and X posts synced from Buffer."
                : "Connect Buffer in Settings to chart posts published to LinkedIn and X."}
            </p>
          </div>
          {buffer ? (
            <p className="font-heading text-sm font-semibold text-brand">
              {chartThisWeek} this week
            </p>
          ) : null}
        </div>
        {buffer ? (
          <PublicationChart data={chartData} />
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No Buffer data yet. Add your API key in Settings, then use Sync now
            on this page.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-subtle bg-card shadow-ambient">
        <div className="border-b border-subtle px-6 py-4 sm:px-8">
          <h2 className="font-heading text-lg font-semibold">
            Content OS published drafts
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Posts you have shipped from this account.
          </p>
        </div>
        {analytics.recentPublished.length === 0 ? (
          <div className="px-6 py-12 text-center sm:px-8">
            <p className="text-sm text-muted-foreground">
              No published posts yet. Mark a draft as published when it goes live.
            </p>
            <Link
              href="/drafts"
              className="mt-4 inline-flex h-9 items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-medium shadow-pill hover:bg-muted/60"
            >
              Open drafts
            </Link>
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
  );
}

export default async function AnalyticsPage() {
  const access = await getAppAccess();
  const isGuest = access?.mode === "guest";

  if (isGuest) {
    return (
      <GuestPreviewPage
        header={
          <AppHeader
            title="Analytics"
            breadcrumb="Insights"
            description="Published output and discovery activity for your account."
          />
        }
        overlay={
          <GuestSignInOverlay
            feature="Analytics"
            description="Preview charts and published-draft history. Sign in to track your real output over time."
          >
            <AnalyticsBody analytics={GUEST_DEMO_ANALYTICS} buffer={null} />
          </GuestSignInOverlay>
        }
      />
    );
  }

  if (!access || access.mode !== "user") {
    return null;
  }

  const [analytics, buffer] = await Promise.all([
    fetchAnalyticsSummary(access.userId),
    fetchBufferAnalyticsSummary(access.userId),
  ]);

  return (
    <>
      <AppHeader
        title="Analytics"
        breadcrumb="Insights"
        description="Published output and discovery activity for your account."
      />
      <AnalyticsBody analytics={analytics} buffer={buffer} />
    </>
  );
}
