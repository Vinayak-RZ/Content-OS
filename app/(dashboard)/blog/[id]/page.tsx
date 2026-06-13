import { Suspense } from "react";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { BlogWorkspace } from "@/components/blog/blog-workspace";
import { serializeBlogPost } from "@/lib/blogs/serialize";
import { getBlogPostDelegate } from "@/lib/blogs/prisma";
import { getAppAccess } from "@/lib/app-access";

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { new?: string };
}) {
  const access = await getAppAccess();

  if (!access || access.mode !== "user") {
    notFound();
  }

  const blogPost = getBlogPostDelegate();
  if (!blogPost) {
    notFound();
  }

  const blog = await blogPost.findFirst({
    where: { id: params.id, userId: access.userId },
  });

  if (!blog) {
    notFound();
  }

  return (
    <>
      <AppHeader title="Blog editor" breadcrumb="Long-form" />
      <div className="page-x flex flex-1 flex-col pb-16 pt-2">
        <Suspense fallback={null}>
          <BlogWorkspace
            blogId={params.id}
            initialBlog={serializeBlogPost(blog)}
            showNewBanner={searchParams.new === "1"}
          />
        </Suspense>
      </div>
    </>
  );
}
