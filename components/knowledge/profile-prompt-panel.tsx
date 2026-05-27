"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { CopyButton } from "@/components/ui/copy-button";
import {
  CONTENT_OS_KNOWLEDGE_FILES,
  buildProfileGenerationPrompt,
  buildProfilePromptBrief,
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
    body: "Click Copy prompt and paste it into ChatGPT, Claude, Gemini, or any AI assistant you already use.",
  },
  {
    title: "Answer a few questions",
    body: "The AI will interview you based on what it already knows about you, or ask targeted questions to fill gaps. Answer in as much detail as you can — or type SKIP anytime to generate from what it has so far.",
  },
  {
    title: "Paste into Knowledge",
    body: "It produces four markdown files. Open each matching document below, replace the template content, and click Save & re-embed on every file so discovery and drafts use your voice.",
  },
  {
    title: "Run discovery",
    body: "Go to the dashboard and run discovery. Topics will rank against your profile, and generated drafts will pull from these files automatically.",
  },
] as const;

export function ProfilePromptPanel({
  className,
  personaType = null,
  personaCustom = null,
}: ProfilePromptPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const prompt = useMemo(
    () => buildProfileGenerationPrompt(personaType, personaCustom),
    [personaType, personaCustom],
  );

  const brief = useMemo(
    () => buildProfilePromptBrief(personaType, personaCustom),
    [personaType, personaCustom],
  );

  return (
    <section
      className={cn(
        "rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5 sm:px-4 sm:py-3",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
          Build knowledge files with AI
        </p>
        <CopyButton
          text={prompt}
          label="Copy prompt"
          copiedLabel="Copied!"
          size="sm"
          variant="default"
          className="shrink-0"
        />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-brand hover:underline"
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "How it works"}
          {expanded ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </button>
      </div>

      {expanded ? (
        <div className="mt-3 space-y-4 border-t border-brand/15 pt-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {brief}
          </p>

          <p className="text-sm leading-relaxed text-muted-foreground">
            You don&apos;t have to write these files from scratch. The prompt
            guides your AI through building a complete profile — writing style,
            background, interests, and how you think — optimized for LinkedIn,
            X, and other social posts in Content OS.
          </p>

          <ol className="space-y-3 text-sm">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 font-heading text-xs font-semibold text-brand">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-foreground">{step.title}</p>
                  <p className="mt-0.5 leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Files the prompt generates
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CONTENT_OS_KNOWLEDGE_FILES.map((f) => (
                <span
                  key={f.slug}
                  className="rounded-full border border-border/60 bg-card px-2.5 py-0.5 text-xs font-medium text-foreground"
                >
                  {f.name}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              If you haven&apos;t yet, use{" "}
              <span className="font-medium text-foreground">
                Import starter templates
              </span>{" "}
              in the sidebar to create empty documents with the right names —
              then paste each AI-generated file into its match.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
