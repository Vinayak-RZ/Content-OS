import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen">
      <div className="pointer-events-none absolute inset-0 mesh-gradient" aria-hidden />

      {/* Brand panel - desktop only */}
      <aside className="surface-forest relative hidden w-[45%] max-w-xl flex-col justify-between border-r border-forest-foreground/10 p-12 lg:flex">
        <Logo
          href="/"
          className="[&_span:first-child]:bg-brand [&_span:first-child]:text-brand-foreground [&_span:last-child]:text-forest-foreground"
        />
        <div>
          <blockquote className="font-display text-3xl font-bold leading-snug tracking-tight text-inherit">
            Discover what matters. Draft in your voice. Publish when ready.
          </blockquote>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-forest-foreground/80">
            Content OS ranks topics against your knowledge base and generates
            drafts you control - for founders, creators, engineers, and anyone
            building a public voice. No auto-posting.
          </p>
        </div>
        <p className="text-xs text-forest-foreground/50">
          Encrypted API keys · Google sign-in
        </p>
      </aside>

      {/* Form panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 lg:hidden">
          <Logo href="/" />
        </div>
        <div className="w-full max-w-md">{children}</div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-foreground hover:text-brand">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
