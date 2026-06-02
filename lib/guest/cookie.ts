import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { GUEST_SESSION_COOKIE, GUEST_SESSION_MAX_AGE_SEC } from "@/lib/guest/constants";
import {
  buildGuestSessionCookieValue,
  isValidGuestSessionValue,
} from "@/lib/guest/cookie-value";

export {
  assertGuestDiscoverAllowed,
  bumpGuestDiscoverCount,
  readGuestDiscoverCount,
  readGuestSessionFromRequest,
} from "@/lib/guest/request";

export function guestSessionCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_SESSION_MAX_AGE_SEC,
  };
}

export async function setGuestSessionCookie(res: NextResponse): Promise<void> {
  res.cookies.set(
    GUEST_SESSION_COOKIE,
    await buildGuestSessionCookieValue(),
    guestSessionCookieOptions(),
  );
}

export async function isGuestSession(): Promise<boolean> {
  const raw = cookies().get(GUEST_SESSION_COOKIE)?.value;
  return isValidGuestSessionValue(raw);
}

