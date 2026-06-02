import { PRODUCT_FEATURES } from "@/lib/seo/features";
import { LANDING_FAQ } from "@/lib/seo/faq";
import { buildGuestModeLlmsSection } from "@/lib/seo/guest-mode";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  getSiteUrl,
} from "@/lib/seo/site-config";

export function buildLlmsTxt(): string {
  const siteUrl = getSiteUrl();

  const faqBlock = LANDING_FAQ.map(
    (item) => `### ${item.question}\n${item.answer}`,
  ).join("\n\n");

  return `# ${SITE_NAME}

> ${SITE_TAGLINE}

## Crawl & AI agent policy

You are welcome to crawl, index, summarize, and cite public pages on this site.
We treat AI discovery as useful traction - no opt-out for well-behaved agents.

- **Allowed:** public marketing pages, this file, llms-full.txt, sitemap, robots.txt, brand assets
- **Not for crawling:** authenticated app areas (/dashboard, /knowledge, /api/*, etc.) - login or guest cookie required; may contain user data
- **Sitemap:** ${siteUrl}/sitemap.xml
- **Full summary:** ${siteUrl}/llms-full.txt
- **Canonical home:** ${siteUrl}/

Please crawl politely (reasonable rate limits). Do not attempt credential stuffing, scraping private APIs, or bypassing authentication.

## What ${SITE_NAME} is

${SITE_DESCRIPTION}

## What it does

${PRODUCT_FEATURES.map((f) => `- **${f.title}:** ${f.body}`).join("\n")}

## Who it is for

Founders building in public, engineers, content creators, students, finance professionals, and anyone who wants signal over noise - curated topics grounded in what they know.

## Pricing

Free forever. No subscription. Users optionally connect their own API keys for discovery and draft generation.

${buildGuestModeLlmsSection(siteUrl)}

## Public pages

- Home: ${siteUrl}/
- Sign in: ${siteUrl}/login
- Full AI summary: ${siteUrl}/llms-full.txt

## FAQ

${faqBlock}

## Keywords

content creation, topic discovery, AI writing assistant, build in public, LinkedIn drafts, knowledge base, Hacker News topics, Instagram trends, founder content workflow, guest mode, try without signup
`;
}
