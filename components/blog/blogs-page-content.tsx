"use client";

import { BlogWritingSection } from "@/components/blog/blog-writing-section";
import { BlogsLibrary } from "@/components/blog/blogs-library";
import { RecentBlogsPanel } from "@/components/blog/recent-blogs-panel";
import type { SerializedBlogSummary } from "@/lib/blogs/types";

export function BlogsPageContent({
  initialBlogs,
  hasTavilyKey,
  hasFirecrawlKey,
  hasAnyDraftKey,
}: {
  initialBlogs: SerializedBlogSummary[];
  hasTavilyKey: boolean;
  hasFirecrawlKey: boolean;
  hasAnyDraftKey: boolean;
}) {
  const recentBlogs = initialBlogs.slice(0, 8);

  return (
    <div className="flex flex-col gap-10">
      <BlogWritingSection
        hasTavilyKey={hasTavilyKey}
        hasFirecrawlKey={hasFirecrawlKey}
        hasAnyDraftKey={hasAnyDraftKey}
      />

      <RecentBlogsPanel blogs={recentBlogs} />

      {initialBlogs.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              All blogs
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every long-form post you&apos;ve generated or marked as published.
            </p>
          </div>
          <BlogsLibrary initialBlogs={initialBlogs} />
        </section>
      ) : null}
    </div>
  );
}
