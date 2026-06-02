import type { Metadata } from "next";
import { GUEST_MODE_LOGIN_DESCRIPTION } from "@/lib/seo/guest-mode";
import {
  CANONICAL_SITE_ORIGIN,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_META_DESCRIPTION,
  SITE_NAME,
  getSiteUrl,
} from "@/lib/seo/site-config";

const HOME_TITLE = "AI content workflow for founders · topic discovery to draft";
const HOME_OG_TITLE = `${SITE_NAME} — AI content workflow for founders`;

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
      default: HOME_OG_TITLE,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_META_DESCRIPTION,
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
      title: HOME_OG_TITLE,
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_OG_TITLE,
      description: SITE_META_DESCRIPTION,
    },
    verification: siteVerification(),
    other: {
      "ai-content-declaration":
        "Public marketing pages may be indexed and cited by AI systems. See /llms.txt.",
    },
  };
}

export const homePageMetadata: Metadata = {
  title: HOME_TITLE,
  description: SITE_META_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: HOME_OG_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_OG_TITLE,
    description: SITE_META_DESCRIPTION,
  },
};

export const loginPageMetadata: Metadata = {
  title: "Get started — sign in or try as guest",
  description: GUEST_MODE_LOGIN_DESCRIPTION,
  alternates: {
    canonical: "/login",
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: `Get started · ${SITE_NAME}`,
    description: GUEST_MODE_LOGIN_DESCRIPTION,
    url: "/login",
  },
  twitter: {
    card: "summary_large_image",
    title: `Get started · ${SITE_NAME}`,
    description: GUEST_MODE_LOGIN_DESCRIPTION,
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
