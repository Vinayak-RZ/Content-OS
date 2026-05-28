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
}: ProfilePromptPanelProps) {
  const [howExpanded, setHowExpanded] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#build") {
      setBuilderOpen(true);
    }
  }, []);

  const prompt = useMemo(
    () => buildProfileGenerationPrompt(personaType, personaCustom),
    [personaType, personaCustom],
  );

  return (
    <section className={cn("space-y-4", className)}>
      <div
        className={cn(
          "rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 sm:px-4 sm:py-3",
        )}
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
            Build knowledge files
          </p>
          <Button
            type="button"
            size="sm"
            variant={builderOpen ? "secondary" : "default"}
            className="shrink-0"
            onClick={() => {
              setBuilderOpen((v) => !v);
              if (!builderOpen) setHowExpanded(false);
            }}
          >
            {builderOpen ? "Close builder" : "Build here"}
          </Button>
          <CopyButton
            text={prompt}
            label="Copy prompt"
            copiedLabel="Copied!"
            size="sm"
            variant="outline"
            className="shrink-0"
          />
          <button
            type="button"
            onClick={() => setHowExpanded((v) => !v)}
            className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-brand hover:underline"
            aria-expanded={howExpanded}
          >
            {howExpanded ? "Show less" : "How it works"}
            {howExpanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>
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
        />
      ) : null}
    </section>
  );
}
