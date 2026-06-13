import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BlogPromoBanner() {
  return (
    <section
      className="flex flex-col gap-4 rounded-xl border border-subtle bg-card px-4 py-4 shadow-ambient sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
      aria-labelledby="blog-promo-heading"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand/10">
          <PenLine className="size-4 text-brand" aria-hidden />
        </div>
        <div>
          <h2
            id="blog-promo-heading"
            className="font-heading text-base font-semibold tracking-tight"
          >
            You can also write a blog
          </h2>
          <p className="mt-0.5 max-w-lg text-sm text-muted-foreground">
            Research sources with Tavily and Firecrawl, pick a read time, and
            generate long-form posts in your voice — all on the Blogs page.
          </p>
        </div>
      </div>
      <Link
        href="/blogs"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 shrink-0")}
      >
        Go to Blogs
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </section>
  );
}
