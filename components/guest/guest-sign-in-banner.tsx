import Link from "next/link";
import { Sparkles } from "lucide-react";

import { SignInButton } from "@/components/auth/sign-in-button";
import { Button } from "@/components/ui/button";

export function GuestSignInBanner({
  compact,
  callbackUrl = "/dashboard",
}: {
  compact?: boolean;
  callbackUrl?: string;
}) {
  return (
    <div
      className={
        compact
          ? "flex flex-col gap-3 rounded-lg border border-brand/25 bg-brand/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          : "flex flex-col gap-4 rounded-xl border border-brand/30 bg-brand/5 px-5 py-4 shadow-ambient sm:flex-row sm:items-center sm:justify-between sm:px-6"
      }
    >
      <div className="flex min-w-0 items-start gap-3">
        <Sparkles
          className="mt-0.5 size-5 shrink-0 text-brand"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="font-heading text-sm font-semibold text-foreground">
            You&apos;re browsing as a guest
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Discovery and topics stay in this browser only. Sign in with Google
            to save your board, knowledge, and drafts.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <SignInButton
          size={compact ? "sm" : "default"}
          callbackUrl={callbackUrl}
          label="Sign in to save"
        />
        <Link href="/login">
          <Button variant="ghost" size={compact ? "sm" : "default"}>
            Account options
          </Button>
        </Link>
      </div>
    </div>
  );
}
