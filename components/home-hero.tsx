"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

gsap.registerPlugin(useGSAP);

const steps = [
  { label: "Foundation", state: "done" as const },
  { label: "Auth", state: "done" as const },
  { label: "Knowledge", state: "active" as const },
  { label: "Discovery", state: "upcoming" as const },
  { label: "Publish", state: "upcoming" as const },
];

export function HomeHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReduced) return;
      gsap.from("[data-hero-item]", {
        opacity: 0,
        y: 12,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-2xl">
    <Card className="w-full" data-hero-item>
      <CardHeader className="text-center">
        <CardDescription>Step 2 of 5 — Getting started</CardDescription>
        <CardTitle className="text-3xl">Welcome to Content OS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div data-hero-item className="space-y-3">
          <Progress value={40} />
          <div className="flex flex-wrap justify-center gap-2">
            {steps.map((step) => (
              <Badge
                key={step.label}
                variant={
                  step.state === "active"
                    ? "brandSolid"
                    : step.state === "done"
                      ? "brand"
                      : "muted"
                }
                className="px-4 py-1.5"
              >
                {step.label}
              </Badge>
            ))}
          </div>
        </div>

        <p
          data-hero-item
          className="text-center text-muted-foreground leading-relaxed"
        >
          Discover high-signal topics, generate drafts in your voice, and publish
          on your terms. Warm neutrals, crisp cards — accent{" "}
          <span className="font-medium text-brand">#F75440</span>.
        </p>

        <div
          data-hero-item
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <SignInButton size="lg" callbackUrl="/dashboard" />
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign in page
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
