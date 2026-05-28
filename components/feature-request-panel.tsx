import { ExternalLink, Github } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  GITHUB_ISSUES_URL,
  GITHUB_NEW_ISSUE_URL,
  GITHUB_REPO_URL,
} from "@/lib/github-links";
import { cn } from "@/lib/utils";

type FeatureRequestPanelProps = {
  variant?: "landing" | "settings";
  className?: string;
};

export function FeatureRequestPanel({
  variant = "landing",
  className,
}: FeatureRequestPanelProps) {
  if (variant === "settings") {
    return (
      <section
        className={cn(
          "rounded-xl border border-subtle bg-card p-6 shadow-ambient sm:p-8",
          className,
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <Github className="size-5 text-foreground" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="font-heading text-lg font-semibold">
                Request a feature
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Want a new source, workflow tweak, or integration? Content OS is
                open on GitHub — open an issue and describe what you need.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={GITHUB_NEW_ISSUE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
              >
                Open GitHub issue
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5",
                )}
              >
                View repo
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn("border-t border-subtle py-section", className)}
      aria-labelledby="feature-request-heading"
    >
      <div className="container-stamped">
        <div className="mx-auto max-w-2xl rounded-xl border border-subtle bg-card px-6 py-8 text-center shadow-ambient sm:px-10 sm:py-10">
          <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-md bg-brand/10">
            <Github className="size-5 text-brand" strokeWidth={1.75} />
          </div>
          <h2
            id="feature-request-heading"
            className="font-heading text-headline-md font-semibold sm:text-xl"
          >
            Want something we don&apos;t have yet?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            Content OS is open source. Request a feature, suggest a discovery
            source, or report a bug on GitHub — we track everything there.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={GITHUB_NEW_ISSUE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            >
              Request on GitHub
              <ExternalLink className="size-4" aria-hidden />
            </a>
            <a
              href={GITHUB_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "gap-2")}
            >
              Browse issues
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
