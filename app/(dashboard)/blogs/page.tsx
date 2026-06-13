import { AppHeader } from "@/components/app-header";
import { BlogsPageContent } from "@/components/blog/blogs-page-content";
import { hasEncryptedSecret } from "@/lib/crypto";
import { listRecentBlogs } from "@/lib/blogs/list";
import { getAppAccess } from "@/lib/app-access";
import { prisma } from "@/lib/db";

export default async function BlogsLibraryPage() {
  const access = await getAppAccess();

  if (!access || access.mode !== "user") {
    return null;
  }

  const [blogs, userKeys] = await Promise.all([
    listRecentBlogs(access.userId, 50),
    prisma.user.findUnique({
      where: { id: access.userId },
      select: {
        tavilyApiKey: true,
        firecrawlApiKey: true,
        openrouterKey: true,
        nvidiaKey: true,
        openaiKey: true,
      },
    }),
  ]);

  const hasAnyDraftKey =
    hasEncryptedSecret(userKeys?.openrouterKey) ||
    hasEncryptedSecret(userKeys?.nvidiaKey) ||
    hasEncryptedSecret(userKeys?.openaiKey);

  return (
    <>
      <AppHeader
        title="Blogs"
        breadcrumb="Long-form"
        description="Research sources, set your read time, and generate long-form posts in your voice."
      />
      <div className="page-x flex flex-1 flex-col pb-16 pt-4 sm:pt-6">
        <BlogsPageContent
          initialBlogs={blogs}
          hasTavilyKey={hasEncryptedSecret(userKeys?.tavilyApiKey)}
          hasFirecrawlKey={hasEncryptedSecret(userKeys?.firecrawlApiKey)}
          hasAnyDraftKey={hasAnyDraftKey}
        />
      </div>
    </>
  );
}
