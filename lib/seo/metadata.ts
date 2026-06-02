import type { Metadata } from "next";
import {
  CANONICAL_SITE_ORIGIN,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  getSiteUrl,
} from "@/lib/seo/site-config";

function siteVerification(): Metadata["verification"] | undefined {
  const google = process.env["GOOGLE_SITE_VERIFICATION"]?.trim();
  if (!google) return undefined;
  return { google };
}

export function buildRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    applicationName: SITE_NAME,
    title: {
      default: `${SITE_NAME} - From discovery to draft on your terms`,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [...SITE_KEYWORDS],
    authors: [{ name: SITE_NAME, url: siteUrl }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "technology",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: "/",
      types: {
        "text/plain": "/llms.txt",
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: SITE_NAME,
      title: `${SITE_NAME} - From discovery to draft on your terms`,
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} - From discovery to draft on your terms`,
      description: SITE_DESCRIPTION,
    },
    verification: siteVerification(),
    other: {
      "ai-content-declaration":
        "Public marketing pages may be indexed and cited by AI systems. See /llms.txt.",
    },
  };
}

export const homePageMetadata: Metadata = {
  title: "From discovery to draft on your terms",
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} - From discovery to draft on your terms`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
};

export const loginPageMetadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Content OS with Google to access your topic board, knowledge base, and drafts.",
  alternates: {
    canonical: "/login",
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: `Sign in · ${SITE_NAME}`,
    description:
      "Sign in to Content OS with Google to access your topic board, knowledge base, and drafts.",
    url: "/login",
  },
};

export const privatePageMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

/** Documented production URL for README / deploy checklists. */
export const PRODUCTION_SITE_URL = CANONICAL_SITE_ORIGIN;
