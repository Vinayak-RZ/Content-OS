"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BookOpen,
  PenLine,
  Radar,
  Sparkles,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { LandingAuthButtons } from "@/components/auth/landing-auth-buttons";
import { Button } from "@/components/ui/button";
import { LANDING_FAQ } from "@/lib/seo/faq";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const features = [
  {
    icon: Radar,
    title: "Signal discovery",
    body: "Pulls from HN, Reddit, RSS, and GitHub. Ranks topics against your knowledge base so you see what matters, not what is loudest.",
  },
  {
    icon: BookOpen,
    title: "Grounded in you",
    body: "Upload context files and interests. Every recommendation is ranked against your profile, not generic trends.",
  },
  {
    icon: PenLine,
    title: "Drafts in your voice",
    body: "Generate long-form drafts from any topic. Edit inline, revise with AI, and keep a library of work in progress.",
  },
  {
    icon: Sparkles,
    title: "Publish on your terms",
    body: "No auto-posting. You approve every word before it leaves. Content OS amplifies thinking; you keep the pen.",
  },
];

const steps = [
  { num: "01", label: "Connect", detail: "Sign in free. Add optional API keys when you're ready - free tiers cover reasonable usage." },
  { num: "02", label: "Seed knowledge", detail: "Upload context files that define your angle." },
  { num: "03", label: "Discover", detail: "Run discovery to populate your topic board." },
  { num: "04", label: "Draft", detail: "Generate, edit, and ship when ready." },
];

export function LandingPage({
  isAuthenticated,
  dashboardHref,
}: {
  isAuthenticated: boolean;
  dashboardHref: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) return;

      gsap.from("[data-hero-reveal]", {
        opacity: 0,
        y: 16,
        duration: 0.55,
        stagger: 0.07,
        ease: "power3.out",
      });

      gsap.from("[data-feature-card]", {
        scrollTrigger: {
          trigger: "[data-features]",
          start: "top 80%",
        },
        opacity: 0,
        y: 20,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 mesh-gradient" aria-hidden />

      <header className="relative z-10 border-b border-subtle bg-background/80 backdrop-blur-sm">
        <div className="container-stamped flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="font-heading text-[15px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="font-heading text-[15px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#faq"
              className="font-heading text-[15px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </a>
          </nav>
          <LandingAuthButtons
            isAuthenticated={isAuthenticated}
            dashboardHref={dashboardHref}
            layout="header"
          />
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="container-stamped pb-section pt-16 sm:pt-24 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <p
              data-hero-reveal
              className="mb-6 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-brand"
            >
              For founders & creators
            </p>
            <h1
              data-hero-reveal
              className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-display-hero"
            >
              <span className="block">From discovery to draft</span>
              <span className="block">on your terms</span>
            </h1>
            <p
              data-hero-reveal
              className="mx-auto mt-6 max-w-2xl text-balance text-body-lg text-muted-foreground"
            >
              Content OS discovers high-signal topics, drafts in your voice, and
              keeps you in control. Less scrolling, more publishing.
            </p>
            <p
              data-hero-reveal
              className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground/90"
            >
              Free forever - use your own API keys and stay within provider free
              tiers for reasonable everyday usage.
            </p>
            <div
              data-hero-reveal
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <LandingAuthButtons
                isAuthenticated={isAuthenticated}
                dashboardHref={dashboardHref}
                size="lg"
                layout="hero"
              />
              <Link href="#how-it-works">
                <Button variant="ghost" size="lg" className="gap-2">
                  See how it works
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Product preview */}
          <div
            data-hero-reveal
            className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-xl border border-subtle bg-card shadow-ambient"
          >
            <div className="flex items-center gap-2 border-b border-subtle bg-muted/40 px-4 py-3">
              <span className="size-2.5 rounded-full bg-brand/70" />
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
              <span className="ml-3 font-heading text-xs font-medium text-muted-foreground">
                Dashboard · Topic board
              </span>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
              {[
                {
                  score: "8.4",
                  title: "Why infra teams are rethinking observability spend",
                  tag: "Saved",
                },
                {
                  score: "7.9",
                  title: "The hidden cost of default LLM routing in prod",
                  tag: "New",
                },
                {
                  score: "7.2",
                  title: "Founders writing in public: quality over cadence",
                  tag: "HN",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-subtle bg-background p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-brand-muted px-2 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wide text-brand">
                      {item.tag}
                    </span>
                    <span className="font-heading text-xs font-semibold text-foreground">
                      {item.score}/10
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-snug text-foreground">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          data-features
          className="border-t border-subtle bg-muted/30 py-section"
        >
          <div className="container-stamped">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-headline-md font-semibold sm:text-headline-lg">
                Built for depth, not volume
              </h2>
              <p className="mt-4 text-muted-foreground">
                A focused workflow from discovery to draft. No feed addiction,
                no auto-publishing, no subscription.
              </p>
              <p className="mt-2 text-sm text-muted-foreground/90">
                The app is free forever. Optional AI and discovery keys are yours
                - most providers&apos; free tiers are enough for regular use.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:gap-8">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <article
                    key={f.title}
                    data-feature-card
                    className="rounded-xl border border-subtle bg-card p-8 shadow-ambient"
                  >
                    <div className="mb-5 flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-heading text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-section">
          <div className="container-stamped">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-headline-md font-semibold sm:text-headline-lg">
                Four steps to your first draft
              </h2>
            </div>
            <ol className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <li key={step.num} className="relative">
                  <span className="font-display text-3xl font-bold text-brand/30">
                    {step.num}
                  </span>
                  <h3 className="mt-2 font-heading text-base font-semibold">
                    {step.label}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ — visible for users and search/AI crawlers */}
        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="border-t border-subtle bg-muted/30 py-section"
        >
          <div className="container-stamped">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                id="faq-heading"
                className="font-heading text-headline-md font-semibold sm:text-headline-lg"
              >
                Frequently asked questions
              </h2>
              <p className="mt-4 text-muted-foreground">
                Quick answers about Content OS — what it is, how pricing works,
                and how your data stays under your control.
              </p>
            </div>
            <dl className="mx-auto mt-12 max-w-3xl divide-y divide-subtle rounded-xl border border-subtle bg-card">
              {LANDING_FAQ.map((item) => (
                <div key={item.question} className="px-6 py-5 sm:px-8">
                  <dt className="font-heading text-base font-semibold text-foreground">
                    {item.question}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* CTA */}
        <section className="surface-forest border-t border-forest-foreground/10 py-section">
          <div className="container-stamped text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to write with signal?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-forest-foreground/80">
              Free forever. Sign in with Google, set up in minutes, and add API
              keys only when you want drafts or discovery - your keys stay
              encrypted.
            </p>
            <div className="mt-8">
              <LandingAuthButtons
                isAuthenticated={isAuthenticated}
                dashboardHref={dashboardHref}
                size="lg"
                layout="cta"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-subtle py-10">
        <div className="container-stamped flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo size="sm" />
          <p className="text-center text-sm text-muted-foreground sm:text-right">
            Content OS · Thinking amplification for founders & creators · Free
            forever
            <span className="mx-2 text-muted-foreground/40" aria-hidden>
              ·
            </span>
            <a
              href="/llms.txt"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              AI & crawlers welcome
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
