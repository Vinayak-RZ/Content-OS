"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { cn } from "@/lib/utils";

export const LANDING_STEPS = [
  {
    num: "01",
    label: "Connect",
    detail:
      "Sign in free. Add optional API keys when you're ready - free tiers cover reasonable usage.",
  },
  {
    num: "02",
    label: "Seed knowledge",
    detail: "Upload context files that define your angle.",
  },
  {
    num: "03",
    label: "Discover",
    detail: "Run discovery to populate your topic board.",
  },
  {
    num: "04",
    label: "Draft",
    detail: "Generate, edit, and ship when ready.",
  },
] as const;

const STEP_COUNT = LANDING_STEPS.length;
const HOLD_S = 2.35;
const TRANSITION_S = 0.7;

function useStepsAnimationEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => setEnabled(desktop.matches && !reduced.matches);
    sync();

    desktop.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      desktop.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return enabled;
}

function setActiveStep(
  nodes: HTMLDivElement[],
  captions: HTMLDivElement[],
  index: number,
) {
  nodes.forEach((node, i) => {
    node.dataset.active = i === index ? "true" : "false";
  });
  captions.forEach((caption, i) => {
    caption.dataset.active = i === index ? "true" : "false";
  });
}

function StaticStepsList({ className }: { className?: string }) {
  return (
    <ol className={cn("mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2", className)}>
      {LANDING_STEPS.map((step) => (
        <li key={step.num}>
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
  );
}

export function LandingStepsFlow() {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animateEnabled = useStepsAnimationEnabled();

  useGSAP(
    () => {
      if (!animateEnabled) return;

      const progress = progressRef.current;
      const nodes = nodeRefs.current.filter(Boolean) as HTMLDivElement[];
      const captions = captionRefs.current.filter(Boolean) as HTMLDivElement[];

      if (!progress || nodes.length !== STEP_COUNT) return;

      gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
      setActiveStep(nodes, captions, 0);

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });

      for (let i = 0; i < STEP_COUNT; i += 1) {
        tl.add(() => setActiveStep(nodes, captions, i));
        tl.to(
          progress,
          {
            scaleX: i / (STEP_COUNT - 1),
            duration: i === 0 ? 0.01 : TRANSITION_S,
            ease: "power2.inOut",
          },
          "<0.05",
        );
        tl.to({}, { duration: HOLD_S });
      }

      return () => {
        tl.kill();
      };
    },
    { scope: rootRef, dependencies: [animateEnabled] },
  );

  return (
    <section id="how-it-works" className="py-section">
      <div className="container-stamped">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-headline-md font-semibold sm:text-headline-lg">
            Four steps to your first draft
          </h2>
        </div>

        {!animateEnabled ? (
          <StaticStepsList className="md:grid-cols-4" />
        ) : (
          <>
            <StaticStepsList className="md:hidden" />

            <div ref={rootRef} className="mx-auto mt-14 hidden max-w-4xl md:block">
              <div className="relative px-4 lg:px-6">
                <div
                  className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-5 h-px bg-border"
                  aria-hidden
                />
                <div
                  ref={progressRef}
                  className="pointer-events-none absolute left-[12.5%] top-5 h-px w-[75%] origin-left scale-x-0 bg-brand"
                  aria-hidden
                />

                <ol className="relative grid grid-cols-4 gap-3 lg:gap-4">
                  {LANDING_STEPS.map((step, index) => (
                    <li
                      key={step.num}
                      className="flex flex-col items-center text-center"
                    >
                      <div
                        ref={(el) => {
                          nodeRefs.current[index] = el;
                        }}
                        data-active={index === 0 ? "true" : "false"}
                        className={cn(
                          "relative z-10 flex size-10 items-center justify-center rounded-full border font-heading text-xs font-semibold",
                          "border-subtle bg-card text-muted-foreground",
                          "transition-[background-color,border-color,color,box-shadow,transform] duration-700 ease-out",
                          "data-[active=true]:scale-105 data-[active=true]:border-brand data-[active=true]:bg-brand data-[active=true]:text-brand-foreground data-[active=true]:shadow-pill",
                        )}
                      >
                        {step.num}
                      </div>

                      <div
                        ref={(el) => {
                          captionRefs.current[index] = el;
                        }}
                        data-active={index === 0 ? "true" : "false"}
                        className={cn(
                          "mt-6 max-w-[11rem] transition-[opacity,transform] duration-700 ease-out lg:max-w-[12.5rem]",
                          "opacity-40 translate-y-1",
                          "data-[active=true]:opacity-100 data-[active=true]:translate-y-0",
                        )}
                      >
                        <h3 className="font-heading text-base font-semibold text-foreground">
                          {step.label}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {step.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
