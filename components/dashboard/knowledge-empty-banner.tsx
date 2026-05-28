import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type KnowledgeEmptyBannerProps = {
  className?: string;
};

export function KnowledgeEmptyBanner({ className }: KnowledgeEmptyBannerProps) {
  return (
    <Link
      href="/knowledge#build"
      className={cn(
        "group block rounded-xl border border-brand/35 bg-brand-muted px-4 py-4 transition-colors hover:border-brand/50 hover:bg-brand-muted/90 sm:px-5 sm:py-5",
        className,
      )}
    >
      <p className="font-heading text-sm font-semibold text-foreground sm:text-base">
        Not getting relevant discoveries or drafts?
      </p>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Topics rank against your knowledge profile. Build yours so discovery and
        drafts match what you actually care about.
      </p>
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand group-hover:underline">
        Build knowledge
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
