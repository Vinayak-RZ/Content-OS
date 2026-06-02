"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { SignInButton } from "@/components/auth/sign-in-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type GuestSignInOverlayProps = {
  feature: string;
  description?: string;
  callbackUrl?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Sign-in gate for guest previews: demo UI scrolls behind; blur + CTA stay
 * centered in the visible pane below the page header (not the full scroll height).
 */
export function GuestSignInOverlay({
  feature,
  description,
  callbackUrl,
  children,
  className,
}: GuestSignInOverlayProps) {
  const pathname = usePathname();
  const signInCallback = callbackUrl ?? pathname ?? "/dashboard";

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-y-auto select-none [&_a]:pointer-events-none [&_button]:pointer-events-none [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none"
        aria-hidden
      >
        {children}
      </div>

      <div
        className="relative z-10 flex min-h-0 flex-1 items-center justify-center p-4 backdrop-blur-md sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-overlay-title"
      >
        <Card className="w-full max-w-md shrink-0 border-subtle shadow-ambient">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-brand/10">
              <Sparkles className="size-5 text-brand" aria-hidden />
            </div>
            <CardTitle id="guest-overlay-title" className="font-heading text-xl">
              Sign in to use {feature}
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {description ??
                `You're previewing ${feature} as a guest. Sign in with Google to save, edit, and connect your API keys.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pb-8">
            <SignInButton
              size="lg"
              callbackUrl={signInCallback}
              label="Sign in with Google"
              className="w-full"
            />
            <Link href="/login" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                Account options
              </Button>
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              Guest mode still includes dashboard discovery — nothing here is
              saved until you sign in.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Wrap page header + guest overlay so the overlay fills the viewport below the header. */
export function GuestPreviewPage({
  header,
  overlay,
}: {
  header: ReactNode;
  overlay: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0">{header}</div>
      <div className="flex min-h-0 flex-1 flex-col">{overlay}</div>
    </div>
  );
}
