import { ExternalLink } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  GITHUB_ISSUES_URL,
  GITHUB_NEW_ISSUE_URL,
  GITHUB_REPO_URL,
} from "@/lib/github-links";
import { cn } from "@/lib/utils";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

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
            <GitHubIcon className="size-5 text-foreground" />
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
            <GitHubIcon className="size-5 text-brand" />
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
