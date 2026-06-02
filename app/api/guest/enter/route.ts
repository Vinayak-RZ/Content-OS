import { NextResponse } from "next/server";

import {
  setGuestSessionCookie,
} from "@/lib/guest/cookie";

/** Start a guest session and open the app (no Google sign-in). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const dest = new URL("/dashboard", url.origin);
  const res = NextResponse.redirect(dest);
  await setGuestSessionCookie(res);
  return res;
}
