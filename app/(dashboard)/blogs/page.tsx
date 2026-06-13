import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { BlogsLibrary } from "@/components/blog/blogs-library";
import { listRecentBlogs } from "@/lib/blogs/list";
import { getAppAccess } from "@/lib/app-access";

export default async function BlogsLibraryPage() {
  const access = await getAppAccess();

  if (!access || access.mode !== "user") {
    return null;
  }

  const blogs = await listRecentBlogs(access.userId, 50);

  return (
    <>
      <AppHeader
        title="Blogs"
        breadcrumb="Library"
        description="Long-form posts you've researched and generated from the dashboard."
      />
      <div className="page-x flex flex-1 flex-col gap-6 pb-16 pt-4 sm:pt-6">
        {blogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-subtle bg-muted/30 px-6 py-16 text-center">
            <p className="font-heading text-base font-semibold text-foreground">
              No blogs yet
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Use the blog writing panel on the dashboard to research sources and
              generate your first long-form post.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-medium text-white shadow-pill"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <BlogsLibrary initialBlogs={blogs} />
        )}
      </div>
    </>
  );
}
