/**
 * Optional Resend digest after discovery cron (§cron spec).
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildDiscoveryDigestHtml(params: {
  displayName: string;
  topics: { title: string; finalScore: number }[];
  appUrl: string;
}): string {
  const items =
    params.topics.length > 0
      ? `<ol>${params.topics
          .map(
            (t) =>
              `<li><strong>${escapeHtml(t.title.slice(0, 200))}</strong> · score ${(t.finalScore * 10).toFixed(1)}/10</li>`,
          )
          .join("")}</ol>`
      : "<p>No new ranked topics this run — open the app to investigate.</p>";

  const href =
    params.appUrl.length > 0
      ? `${params.appUrl.replace(/\/$/, "")}/dashboard`
      : "";

  const link =
    href.length > 0
      ? `<p><a href="${href.replace(/"/g, "")}">Open dashboard</a></p>`
      : "";

  return `
  <div style="font-family:system-ui,sans-serif;line-height:1.5">
    <p>Hi ${escapeHtml(params.displayName)},</p>
    <p>Your latest discovery run surfaced these top signals:</p>
    ${items}
    ${link}
    <p style="color:#666;font-size:12px">You’re receiving this because email digest is on in Settings.</p>
  </div>`;
}

export async function sendDiscoveryDigestEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key =
    typeof process.env["RESEND_API_KEY"] === "string"
      ? process.env["RESEND_API_KEY"].trim()
      : "";
  const from =
    typeof process.env["RESEND_FROM_EMAIL"] === "string"
      ? process.env["RESEND_FROM_EMAIL"].trim()
      : "";
  if (!key || !from) {
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
    signal: AbortSignal.timeout(25_000),
  });

  return res.ok;
}
