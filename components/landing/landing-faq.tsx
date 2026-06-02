import { ChevronDown } from "lucide-react";

import { LANDING_FAQ } from "@/lib/seo/faq";
import { cn } from "@/lib/utils";

export function LandingFaq() {
  return (
    <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-xl border border-subtle bg-card">
      {LANDING_FAQ.map((item, index) => (
        <details
          key={item.question}
          className="group border-b border-subtle last:border-b-0"
          open={index === 0}
        >
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 sm:px-8",
              "[&::-webkit-details-marker]:hidden",
            )}
          >
            <h3 className="font-heading text-base font-semibold text-foreground">
              {item.question}
            </h3>
            <ChevronDown
              className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-8">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
