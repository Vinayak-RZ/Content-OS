import { GITHUB_REPO_URL } from "@/lib/github-links";
import {
  FOUNDER_LINKEDIN_URL,
  FOUNDER_NAME,
  FOUNDER_X_URL,
  GITHUB_PROFILE_URL,
} from "@/lib/seo/social-links";
import { Logo } from "@/components/brand/logo";

const linkClass =
  "underline-offset-2 hover:text-foreground hover:underline";

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      {label}
    </a>
  );
}

function InternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className={linkClass}>
      {label}
    </a>
  );
}

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-subtle py-10">
      <div className="container-stamped flex flex-col gap-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-start">
          <Logo size="sm" />
          <p className="max-w-xl text-center text-sm leading-relaxed text-muted-foreground sm:text-right">
            Built by{" "}
            <ExternalLink href={FOUNDER_LINKEDIN_URL} label={FOUNDER_NAME} /> —
            open-source on{" "}
            <ExternalLink href={GITHUB_REPO_URL} label="GitHub" />.
          </p>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-subtle pt-6 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
          <p>
            Content OS · Free forever ·{" "}
            <InternalLink href="/llms.txt" label="AI & crawlers welcome" />
            <span className="mx-2 text-muted-foreground/40" aria-hidden>
              ·
            </span>
            <InternalLink href="/llms-full.txt" label="Full summary" />
          </p>
          <nav
            aria-label="Social and project links"
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end"
          >
            <ExternalLink href={GITHUB_REPO_URL} label="GitHub repo" />
            <ExternalLink href={GITHUB_PROFILE_URL} label="GitHub" />
            <ExternalLink href={FOUNDER_LINKEDIN_URL} label="LinkedIn" />
            <ExternalLink href={FOUNDER_X_URL} label="X" />
          </nav>
        </div>
      </div>
    </footer>
  );
}
