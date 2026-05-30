"use client";

import Link from "next/link";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Button } from "@/components/ui/button";

interface LandingAuthButtonsProps {
  isAuthenticated: boolean;
  dashboardHref: string;
  size?: "sm" | "lg";
  layout?: "header" | "hero" | "cta";
}

export function LandingAuthButtons({
  isAuthenticated,
  dashboardHref,
  size = "sm",
  layout = "header",
}: LandingAuthButtonsProps) {
  if (isAuthenticated) {
    if (layout === "header") {
      return (
        <div className="flex items-center gap-3">
          <Link href={dashboardHref}>
            <Button variant="ghost" size={size}>
              Dashboard
            </Button>
          </Link>
          <Link href={dashboardHref}>
            <Button size={size}>Open app</Button>
          </Link>
        </div>
      );
    }

    return (
      <Link href={dashboardHref} className="w-full sm:w-auto">
        <Button size={size} className="w-full sm:w-auto">
          {layout === "hero" ? "Go to dashboard" : "Open dashboard"}
        </Button>
      </Link>
    );
  }

  if (layout === "header") {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="hidden sm:block">
          <Button variant="ghost" size={size}>
            Sign in
          </Button>
        </Link>
        <SignInButton size={size} callbackUrl="/dashboard" label="Get started" />
      </div>
    );
  }

  if (layout === "cta") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SignInButton size={size} callbackUrl="/dashboard" label="Get started" />
        <Link href="/login">
          <Button
            variant="ghost"
            size={size}
            className="border-forest-foreground/25 bg-transparent text-forest-foreground hover:border-forest-foreground/40 hover:bg-forest-foreground/10 hover:text-forest-foreground"
          >
            Sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
      <SignInButton
        size={size}
        callbackUrl="/dashboard"
        label="Get started"
        className="w-full sm:w-auto"
      />
      <Link href="/login" className="w-full sm:w-auto">
        <Button variant="ghost" size={size} className="w-full sm:w-auto">
          Sign in
        </Button>
      </Link>
    </div>
  );
}
