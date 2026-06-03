"use client";

import Link from "next/link";
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
        <Link href="/login">
          <Button size={size}>Get started</Button>
        </Link>
      </div>
    );
  }

  if (layout === "cta") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/login">
          <Button size={size} className={buttonClassName}>
            Get started
          </Button>
        </Link>
        <Link href="/api/guest/enter">
          <Button
            variant="outline"
            size={size}
            className="border-forest-foreground/25 bg-transparent text-forest-foreground hover:border-forest-foreground/40 hover:bg-forest-foreground/10 hover:text-forest-foreground"
          >
            Try as guest
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link href="/login">
        <Button size={size} className={buttonClassName}>
          Get started
        </Button>
      </Link>
      <Link href="/api/guest/enter">
        <Button variant="outline" size={size} className={buttonClassName}>
          Try as guest
        </Button>
      </Link>
    </>
  );
}
