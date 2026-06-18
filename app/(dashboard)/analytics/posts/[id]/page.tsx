import Link from "next/link";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { SocialPostMetrics } from "@/components/analytics/social-post-metrics";
import { fetchSocialPostDetail } from "@/lib/analytics/buffer-summary";
import { getAppAccess } from "@/lib/app-access";

type PageProps = { params: { id: string } };

export default async function SocialPostAnalyticsPage({ params }: PageProps) {
  const access = await getAppAccess();
  if (!access || access.mode !== "user") {
    notFound();
  }

  const post = await fetchSocialPostDetail(access.userId, params.id);
  if (!post) {
    notFound();
  }

  return (
    <>
      <AppHeader
        title="Post analytics"
        breadcrumb="Insights"
        description={`${post.platform} · ${post.channelName}`}
      />
      <div className="page-x flex flex-1 flex-col gap-6 pb-16 pt-4 sm:gap-8 sm:pt-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/analytics"
            className="font-heading font-semibold text-brand hover:underline"
          >
            ← Back to analytics
          </Link>
          {post.draft ? (
            <Link
              href={`/draft/${post.draft.id}`}
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              View draft: {post.draft.topicTitle}
            </Link>
          ) : null}
        </div>

        <section className="rounded-xl border border-subtle bg-card p-6 shadow-ambient sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {post.platform} · {post.status}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                {post.text}
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              {post.publishedAt ? (
                <p>Published {new Date(post.publishedAt).toLocaleString()}</p>
              ) : null}
              {post.scheduledAt ? (
                <p>Scheduled {new Date(post.scheduledAt).toLocaleString()}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-subtle bg-card p-6 shadow-ambient sm:p-8">
          <h2 className="font-heading text-lg font-semibold">Performance</h2>
          <div className="mt-6">
            <SocialPostMetrics
              metrics={post.metrics}
              metricsUpdatedAt={post.metricsUpdatedAt}
            />
          </div>
        </section>
      </div>
    </>
  );
}
