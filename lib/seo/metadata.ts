import type { Metadata } from "next";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  getSiteUrl,
} from "@/lib/seo/site-config";

export function buildRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${SITE_NAME} - ${SITE_TAGLINE}`,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [...SITE_KEYWORDS],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "technology",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
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
      images: [
        {
          url: "/brand/logo-mark.png",
          width: 512,
          height: 512,
          alt: `${SITE_NAME} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} - From discovery to draft on your terms`,
      description: SITE_DESCRIPTION,
      images: ["/brand/logo-mark.png"],
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

export const privatePageMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
