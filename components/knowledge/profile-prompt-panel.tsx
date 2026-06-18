"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { KnowledgeBuilderForm } from "@/components/knowledge/knowledge-builder-form";
import {
  buildProfileGenerationPrompt,
} from "@/lib/knowledge/profile-generation-prompt";
import type { PersonaType } from "@/lib/personas/types";
import { cn } from "@/lib/utils";

type ProfilePromptPanelProps = {
  className?: string;
  personaType?: PersonaType | null;
  personaCustom?: string | null;
  studioMode?: boolean;
};

const STEPS = [
  {
    title: "Copy the prompt",
    body: "Paste it into ChatGPT, Claude, Gemini, or any AI assistant you use.",
  },
  {
    title: "Answer the questions",
    body: "Reply in detail, or type SKIP anytime to generate from what the AI already knows.",
  },
  {
    title: "Paste into Knowledge",
    body: "Replace each template below and click Save & re-embed on every file.",
  },
  {
    title: "Run discovery",
    body: "Topics and drafts will rank and write using your saved profile.",
  },
] as const;

export function ProfilePromptPanel({
  className,
  personaType = null,
  personaCustom = null,
  studioMode = false,
}: ProfilePromptPanelProps) {
  const [howExpanded, setHowExpanded] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#build" || studioMode) {
      setBuilderOpen(true);
    }
  }, [studioMode]);

  const prompt = useMemo(
    () => buildProfileGenerationPrompt(personaType, personaCustom),
    [personaType, personaCustom],
  );

  function toggleBuilder(): void {
    setBuilderOpen((v) => {
      if (!v) setHowExpanded(false);
      return !v;
    });
  }

  function renderBuildButton(extraClassName?: string) {
    return (
      <Button
        type="button"
        size="sm"
        variant={builderOpen ? "secondary" : "default"}
        className={cn("shrink-0 whitespace-nowrap", extraClassName)}
        onClick={toggleBuilder}
      >
        {builderOpen ? "Close builder" : "Build here"}
      </Button>
    );
  }

  function renderCopyButton(extraClassName?: string) {
    return (
      <CopyButton
        text={prompt}
        label="Copy prompt"
        copiedLabel="Copied!"
        size="sm"
        variant="outline"
        className={cn("shrink-0 whitespace-nowrap", extraClassName)}
      />
    );
  }

  function renderHowItWorksButton(extraClassName?: string) {
    return (
      <button
        type="button"
        onClick={() => setHowExpanded((v) => !v)}
        className={cn(
          "inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-brand hover:underline",
          extraClassName,
        )}
        aria-expanded={howExpanded}
      >
        {howExpanded ? "Show less" : "How it works"}
        {howExpanded ? (
          <ChevronUp className="size-3.5" />
        ) : (
          <ChevronDown className="size-3.5" />
        )}
      </button>
    );
  }

  function renderActionButtonPair(orientation: "vertical" | "horizontal") {
    const pairClassName =
      orientation === "vertical"
        ? "col-start-2 row-start-1 row-span-2 grid w-max grid-rows-2 items-center gap-y-2.5"
        : "inline-grid w-max grid-cols-2 items-center gap-2";

    return (
      <div className={pairClassName}>
        {renderBuildButton("w-full")}
        {renderCopyButton("w-full")}
      </div>
    );
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div
        className={cn(
          "rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 sm:px-4 sm:py-3",
        )}
      >
        {/* Mobile: title + How it works on the left; buttons on the right */}
        <div className="grid grid-cols-[1fr_auto] grid-rows-2 items-center gap-x-3 gap-y-2.5 sm:hidden">
          <p className="col-start-1 row-start-1 min-w-0 text-sm font-medium leading-snug text-foreground">
            Build knowledge files
          </p>
          <div className="col-start-1 row-start-2 justify-self-start">
            {renderHowItWorksButton()}
          </div>
          {renderActionButtonPair("vertical")}
        </div>

        {/* Desktop: original single-row layout */}
        <div className="hidden flex-wrap items-center gap-2 sm:flex sm:gap-3">
          <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
            Build knowledge files
          </p>
          {renderActionButtonPair("horizontal")}
          {renderHowItWorksButton()}
        </div>

        {howExpanded ? (
          <ol className="mt-3 space-y-2 border-t border-brand/15 pt-3 text-sm">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 font-heading text-xs font-semibold text-brand">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : null}
      </div>

      {builderOpen ? (
        <KnowledgeBuilderForm
          personaType={personaType}
          personaCustom={personaCustom}
          studioMode={studioMode}
        />
      ) : null}
    </section>
  );
}
