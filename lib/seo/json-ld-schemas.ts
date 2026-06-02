import { GUEST_MODE_LOGIN_DESCRIPTION } from "@/lib/seo/guest-mode";
import { LANDING_FAQ } from "@/lib/seo/faq";
import { ONBOARDING_STEPS } from "@/lib/seo/steps";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SAME_AS,
  SITE_TAGLINE,
  getSiteUrl,
} from "@/lib/seo/site-config";

const SCHEMA_CONTEXT = "https://schema.org";

export function buildHomeJsonLd() {
  const siteUrl = getSiteUrl();
  const logoUrl = `${siteUrl}/brand/logo-mark.png`;
  const modified = new Date().toISOString().split("T")[0];

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: SITE_NAME,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
          width: 512,
          height: 512,
        },
        sameAs: [...SITE_SAME_AS],
        description: SITE_TAGLINE,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#software`,
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Content Management",
        operatingSystem: "Web",
        url: siteUrl,
        description: SITE_DESCRIPTION,
        isAccessibleForFree: true,
        dateModified: modified,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description:
            "Free forever - optional BYOK API keys for discovery and drafts",
          availability: "https://schema.org/InStock",
        },
        featureList: [
          "Topic discovery from Hacker News, Instagram, Reddit, RSS, and GitHub",
          "Knowledge-base ranking against your profile",
          "AI drafts in your voice",
          "Manual publish workflow with no auto-posting",
          "Encrypted BYOK API key storage",
          "Guest preview without an account (session-only)",
        ],
        audience: {
          "@type": "Audience",
          audienceType:
            "Founders, engineers, creators, and operators building a personal brand",
        },
        provider: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "HowTo",
        "@id": `${siteUrl}/#howto`,
        name: "How to create your first draft with Content OS",
        description:
          "Try as guest or sign in, seed your knowledge base, run discovery, and generate a draft in your voice.",
        step: ONBOARDING_STEPS.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.label,
          text: step.detail,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: LANDING_FAQ.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export function buildLoginJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebPage",
    name: `Get started · ${SITE_NAME}`,
    url: `${siteUrl}/login`,
    description: GUEST_MODE_LOGIN_DESCRIPTION,
    isPartOf: { "@id": `${siteUrl}/#website` },
    inLanguage: "en-US",
  };
}
