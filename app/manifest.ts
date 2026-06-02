import type { MetadataRoute } from "next";

import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo/site-config";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();

  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F7",
    theme_color: "#FAF9F7",
    lang: "en-US",
    scope: "/",
    icons: [
      {
        src: `${siteUrl}/favicon-48x48.png`,
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: `${siteUrl}/favicon-32x32.png`,
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
