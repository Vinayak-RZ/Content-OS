import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type TavilySetupBannerProps = {
  className?: string;
};

export function TavilySetupBanner({ className }: TavilySetupBannerProps) {
  return (
    <Link
      href="/settings"
      className={cn(
        "group block rounded-xl border border-border/80 bg-muted/30 px-4 py-4 transition-colors hover:border-brand/40 hover:bg-muted/50 sm:px-5 sm:py-5",
        className,
      )}
    >
      <p className="font-heading text-sm font-semibold text-foreground sm:text-base">
        Discovery is limited without Tavily
      </p>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Right now we pull from RSS, Reddit, Hacker News, and GitHub. Add a Tavily
        API key for broader web search across design, finance, product, and more.
      </p>
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand group-hover:underline">
        Add Tavily key in Settings
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
