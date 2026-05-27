import type { MetadataRoute } from "next";

import {
  AI_CRAWLER_AGENTS,
  PRIVATE_CRAWL_PATHS,
  PUBLIC_CRAWL_PATHS,
} from "@/lib/seo/ai-crawlers";
import { getSiteUrl } from "@/lib/seo/site-config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const host = new URL(siteUrl).host;

  const aiRules = AI_CRAWLER_AGENTS.map((userAgent) => ({
    userAgent,
    allow: [...PUBLIC_CRAWL_PATHS],
    disallow: [...PRIVATE_CRAWL_PATHS],
  }));

  return {
    rules: [
      ...aiRules,
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_CRAWL_PATHS],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host,
  };
}
