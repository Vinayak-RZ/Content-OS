import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/seo/site-config";

export const runtime = "edge";

export const alt = `${SITE_NAME} — From discovery to draft on your terms`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background:
            "linear-gradient(145deg, #FAF9F7 0%, #F3EBE3 48%, #EDE4DA 100%)",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#C0392B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FAF9F7",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            C
          </div>
          <span
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: -1.5,
              color: "#001410",
            }}
          >
            {SITE_NAME}
          </span>
        </div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -2,
            color: "#001410",
            maxWidth: 900,
          }}
        >
          From discovery to draft on your terms
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            lineHeight: 1.45,
            color: "#4A5C57",
            maxWidth: 880,
          }}
        >
          High-signal topics ranked against your knowledge. Drafts in your voice.
          Free with your API keys — no auto-posting.
        </div>
      </div>
    ),
    { ...size },
  );
}
