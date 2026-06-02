import { getSiteUrl } from "@/lib/seo/site-config";

/** Declares sitemap location for crawlers that do not read robots.txt first. */
export function SitemapHeadLink() {
  const href = `${getSiteUrl()}/sitemap.xml`;
  return (
    <link rel="sitemap" type="application/xml" title="Sitemap" href={href} />
  );
}
