import type { NextRequest, NextResponse } from "next/server";

import {
  isValidGuestSessionValue,
  parseDiscoverLimitPayload,
  buildDiscoverLimitCookieValue,
} from "@/lib/guest/cookie-value";
import {
  GUEST_DISCOVER_COOKIE,
  GUEST_DISCOVER_DAILY_LIMIT,
  GUEST_SESSION_COOKIE,
} from "@/lib/guest/constants";
import { utcDayWindowKey } from "@/lib/rate-limit";

/** Safe in middleware and route handlers only (not RSC render). */
export function clearGuestCookiesOnResponse(res: NextResponse): void {
  res.cookies.delete(GUEST_SESSION_COOKIE);
  res.cookies.delete(GUEST_DISCOVER_COOKIE);
}

/** Edge-safe: no Node `crypto`, no `next/headers`. */
export async function readGuestSessionFromRequest(
  req: NextRequest,
): Promise<boolean> {
  return isValidGuestSessionValue(req.cookies.get(GUEST_SESSION_COOKIE)?.value);
}

export async function readGuestDiscoverCount(req: NextRequest): Promise<number> {
  const parsed = await parseDiscoverLimitPayload(
    req.cookies.get(GUEST_DISCOVER_COOKIE)?.value,
  );
  const today = utcDayWindowKey();
  if (!parsed || parsed.day !== today) return 0;
  return parsed.count;
}

export async function assertGuestDiscoverAllowed(req: NextRequest): Promise<void> {
  if ((await readGuestDiscoverCount(req)) >= GUEST_DISCOVER_DAILY_LIMIT) {
    throw new Error("RATE_LIMIT_GUEST");
  }
}

export async function bumpGuestDiscoverCount(
  res: NextResponse,
  req: NextRequest,
): Promise<void> {
  const today = utcDayWindowKey();
  const current = await readGuestDiscoverCount(req);
  const next = current + 1;
  const value = await buildDiscoverLimitCookieValue(next, today);
  res.cookies.set(GUEST_DISCOVER_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 2,
  });
}
