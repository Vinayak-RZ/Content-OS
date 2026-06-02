import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  clearGuestCookiesOnResponse,
  readGuestSessionFromRequest,
} from "@/lib/guest/request";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/settings",
  "/onboarding",
  "/knowledge",
  "/draft/",
  "/drafts",
  "/activity",
  "/analytics",
] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function middleware(req: NextRequest) {
  if (!isProtectedPath(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (token?.sub) {
    const res = NextResponse.next();
    clearGuestCookiesOnResponse(res);
    return res;
  }

  if (await readGuestSessionFromRequest(req)) {
    if (req.nextUrl.pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  const signIn = new URL("/login", req.url);
  signIn.searchParams.set("callbackUrl", req.nextUrl.pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings",
    "/onboarding",
    "/knowledge/:path*",
    "/draft/:path*",
    "/drafts",
    "/activity",
    "/analytics",
  ],
};
