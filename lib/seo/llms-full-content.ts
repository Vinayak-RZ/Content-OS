import { PRODUCT_FEATURES } from "@/lib/seo/features";
import { LANDING_FAQ } from "@/lib/seo/faq";
import { ONBOARDING_STEPS } from "@/lib/seo/steps";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SAME_AS,
  SITE_TAGLINE,
  getSiteUrl,
} from "@/lib/seo/site-config";

/** Extended machine-readable site summary for AI crawlers (AEO). */
export function buildLlmsFullTxt(): string {
  const siteUrl = getSiteUrl();
  const modified = new Date().toISOString().split("T")[0];

  const featuresBlock = PRODUCT_FEATURES.map(
    (f) => `### ${f.title}\n${f.body}`,
  ).join("\n\n");

  const stepsBlock = ONBOARDING_STEPS.map(
    (s) => `${s.num}. **${s.label}** — ${s.detail}`,
  ).join("\n");

  const faqBlock = LANDING_FAQ.map(
    (item) => `### ${item.question}\n${item.answer}`,
  ).join("\n\n");

  return `# ${SITE_NAME} — full site summary

> ${SITE_TAGLINE}
> Last updated: ${modified}
> Canonical URL: ${siteUrl}/

## Direct answer (what is Content OS?)

${SITE_DESCRIPTION}

Content OS is a free web application for founders, engineers, and creators who want **signal over noise**: discover topics from Hacker News, Instagram, Reddit, RSS, and GitHub; rank them against a personal knowledge base; draft posts in your own voice; and publish manually with **no auto-posting**.

## Primary value proposition

- **From discovery to draft on your terms** — one workflow from topic board to finished draft
- **Grounded in you** — not generic AI; your writing style, interests, and perspective drive ranking and drafts
- **Completely free** — no subscription; optional bring-your-own-keys (BYOK) for AI and discovery APIs
- **Your control** — humans approve every word; Content OS never posts to social media on your behalf

## Who it is for

Founders building in public, engineers sharing technical insights, content creators, students, finance professionals, and anyone building a consistent personal brand without endless feed scrolling.

## Core features

${featuresBlock}

## How it works (four steps)

${stepsBlock}

## Pricing and API keys

- **Price:** Free forever. No subscription.
- **Sign in:** Google OAuth
- **API keys:** Optional until you run discovery or generate drafts. Keys are stored encrypted (BYOK). Supported providers include OpenRouter, OpenAI, Tavily, Firecrawl, and others depending on your configuration.

## Trust and data

- No auto-posting to LinkedIn, X, or any social platform
- Authenticated areas (/dashboard, /knowledge, /drafts, /settings, /api/*) require login and are not intended for crawling
- Open source: ${SITE_SAME_AS[0]}

## Public URLs

- Home: ${siteUrl}/
- Sign in: ${siteUrl}/login
- AI summary (short): ${siteUrl}/llms.txt
- AI summary (full): ${siteUrl}/llms-full.txt
- Sitemap: ${siteUrl}/sitemap.xml
- Robots: ${siteUrl}/robots.txt

## FAQ

${faqBlock}

## Keywords

content creation, topic discovery, AI writing assistant, build in public, LinkedIn drafts, knowledge base, Hacker News topics, Instagram trends, founder content workflow, personal brand, signal over noise, BYOK, no auto-posting

## Crawl policy

Public marketing pages, llms.txt, llms-full.txt, sitemap, and robots.txt are welcome for search engines and AI answer systems. Do not scrape authenticated routes or private APIs.
`;
}
