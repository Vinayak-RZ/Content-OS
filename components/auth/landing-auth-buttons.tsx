"use client";

import Link from "next/link";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Button } from "@/components/ui/button";

interface LandingAuthButtonsProps {
  isAuthenticated: boolean;
  dashboardHref: string;
  size?: "sm" | "lg";
  layout?: "header" | "hero" | "cta";
  buttonClassName?: string;
}

export function LandingAuthButtons({
  isAuthenticated,
  dashboardHref,
  size = "sm",
  layout = "header",
  buttonClassName,
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
      <Link href={dashboardHref}>
        <Button size={size} className={buttonClassName}>
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
    <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
      <SignInButton
        size={size}
        callbackUrl="/dashboard"
        label="Get started"
        className={buttonClassName}
      />
      <Link href="/login">
        <Button variant="ghost" size={size} className={buttonClassName}>
          Sign in
        </Button>
      </Link>
    </div>
  );
}
