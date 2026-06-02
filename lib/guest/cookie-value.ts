import { signGuestPayload, verifyGuestSignedValue } from "@/lib/guest/hmac";
import { utcDayWindowKey } from "@/lib/rate-limit";

const GUEST_PAYLOAD = "guest-v1";

export async function buildGuestSessionCookieValue(): Promise<string> {
  const sig = await signGuestPayload(GUEST_PAYLOAD);
  return `${GUEST_PAYLOAD}.${sig}`;
}

export async function isValidGuestSessionValue(
  raw: string | undefined,
): Promise<boolean> {
  if (!raw) return false;
  return verifyGuestSignedValue(raw, GUEST_PAYLOAD);
}

type DiscoverLimitPayload = `${string}:${number}`;

function discoverLimitPayload(
  count: number,
  day = utcDayWindowKey(),
): DiscoverLimitPayload {
  return `${day}:${count}`;
}

export async function parseDiscoverLimitPayload(
  raw: string | undefined,
): Promise<{ day: string; count: number } | null> {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = raw.slice(0, dot);
  if (!(await verifyGuestSignedValue(raw, body))) return null;
  const colon = body.indexOf(":");
  if (colon < 0) return null;
  const day = body.slice(0, colon);
  const count = Number.parseInt(body.slice(colon + 1), 10);
  if (!day || !Number.isFinite(count) || count < 0) return null;
  return { day, count };
}

export async function buildDiscoverLimitCookieValue(
  count: number,
  day = utcDayWindowKey(),
): Promise<string> {
  const body = discoverLimitPayload(count, day);
  const sig = await signGuestPayload(body);
  return `${body}.${sig}`;
}
