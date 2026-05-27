import { LANDING_FAQ } from "@/lib/seo/faq";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  getSiteUrl,
} from "@/lib/seo/site-config";

export function buildHomeJsonLd() {
  const siteUrl = getSiteUrl();

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: siteUrl,
      description: SITE_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free app — users bring their own API keys for AI features",
      },
      featureList: [
        "Topic discovery from Hacker News, Reddit, RSS, and GitHub",
        "Knowledge-base ranking against your profile",
        "AI drafts in your voice",
        "Manual publish workflow with no auto-posting",
        "Encrypted BYOK API key storage",
      ],
      audience: {
        "@type": "Audience",
        audienceType: SITE_TAGLINE,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: LANDING_FAQ.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];
}
