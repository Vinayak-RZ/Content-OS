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

import { PRODUCT_FEATURES } from "@/lib/seo/features";
import { Logo } from "@/components/brand/logo";
import { LandingAuthButtons } from "@/components/auth/landing-auth-buttons";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingStepsFlow } from "@/components/landing/landing-steps-flow";
import { FeatureRequestPanel } from "@/components/feature-request-panel";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const features = PRODUCT_FEATURES.map((f) => ({
  ...f,
  icon:
    f.title === "Signal discovery"
      ? Radar
      : f.title === "Grounded in you"
        ? BookOpen
        : f.title === "Drafts in your voice"
          ? PenLine
          : Sparkles,
}));

const HERO_CTA_BUTTON_CLASS =
  "w-[13.25rem] justify-center px-8";

const previewTopics = [
  {
    score: "8.6",
    title: "One great post beats five rushed ones",
    titleShort: "One post beats five rushed",
    tag: "Saved",
  },
  {
    score: "7.4",
    title: "Free tools replacing paid apps this year",
    titleShort: "Free tools replacing paid apps",
    tag: "HN",
  },
  {
    score: "6.9",
    title: "What creators wish they knew before posting daily",
    titleShort: "Before posting daily",
    tag: "Insta",
  },
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
              Founders & creators
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
              Content OS finds high-signal topics and drafts in your voice. Free
              with your API keys, no auto-posting.
            </p>
            <div
              data-hero-reveal
              className="mx-auto mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap"
            >
              <LandingAuthButtons
                isAuthenticated={isAuthenticated}
                dashboardHref={dashboardHref}
                size="lg"
                layout="hero"
                buttonClassName={HERO_CTA_BUTTON_CLASS}
              />
              <Link href="#how-it-works">
                <Button
                  variant="ghost"
                  size="lg"
                  className={`gap-2 ${HERO_CTA_BUTTON_CLASS}`}
                >
                  How it works
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
                Topic board
              </span>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
              {previewTopics.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-subtle bg-background p-4"
                >
                  <div className="mb-2.5 flex items-center justify-between sm:mb-3">
                    <span className="rounded-full bg-brand-muted px-2 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wide text-brand">
                      {item.tag}
                    </span>
                    <span className="font-heading text-xs font-semibold text-foreground">
                      {item.score}/10
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-snug text-foreground">
                    <span className="sm:hidden">{item.titleShort}</span>
                    <span className="hidden sm:inline">{item.title}</span>
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
              <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
                Discovery to draft in one workflow. No feed addiction, no
                auto-publishing, free with your keys.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:gap-8">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <article
                    key={f.title}
                    data-feature-card
                    className="rounded-xl border border-subtle bg-card p-6 shadow-ambient sm:p-8"
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

        <LandingStepsFlow />

        {/* FAQ - visible for users and search/AI crawlers */}
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
              <p className="mt-3 text-sm text-muted-foreground sm:mt-4">
                Pricing, keys, and how your data stays yours.
              </p>
            </div>
            <LandingFaq />
          </div>
        </section>

        <FeatureRequestPanel variant="landing" />

        {/* CTA */}
        <section className="surface-forest border-t border-forest-foreground/10 py-section">
          <div className="container-stamped text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">
              Ready to write with signal?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-forest-foreground/80 sm:mt-4 sm:max-w-lg sm:text-base">
              Free forever. Sign in with Google, add keys when you want drafts
              or discovery.
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
            <span className="mx-2 text-muted-foreground/40" aria-hidden>
              ·
            </span>
            <a
              href="/llms-full.txt"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              Full summary
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
