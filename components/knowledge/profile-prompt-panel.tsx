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
  variant?: "compact" | "full";
  className?: string;
  personaType?: PersonaType | null;
  personaCustom?: string | null;
};

export function ProfilePromptPanel({
  variant = "full",
  className,
  personaType = null,
  personaCustom = null,
}: ProfilePromptPanelProps) {
  const [expanded, setExpanded] = useState(variant === "full");

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
        "rounded-xl border border-brand/20 bg-brand/5 p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-heading text-sm font-semibold tracking-tight">
            Build your knowledge files with AI
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{brief}</p>
        </div>
        <CopyButton
          text={prompt}
          label="Copy prompt"
          copiedLabel="Copied!"
          size="default"
          variant="default"
          className="shrink-0"
        />
      </div>

      <ol className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">1.</span> Copy the prompt
          into your AI assistant (ChatGPT, Claude, etc.)
        </li>
        <li>
          <span className="font-medium text-foreground">2.</span> Answer its
          questions — or type SKIP to generate from what it already knows
        </li>
        <li>
          <span className="font-medium text-foreground">3.</span> Paste each
          generated file into the matching Knowledge document below
        </li>
      </ol>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CONTENT_OS_KNOWLEDGE_FILES.map((f) => (
          <span
            key={f.slug}
            className="rounded-full border border-border/60 bg-card px-2.5 py-0.5 text-xs font-medium text-foreground"
          >
            {f.name}
          </span>
        ))}
      </div>

      {variant === "compact" ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          {expanded ? (
            <>
              Hide prompt preview
              <ChevronUp className="size-3.5" />
            </>
          ) : (
            <>
              Preview prompt
              <ChevronDown className="size-3.5" />
            </>
          )}
        </button>
      ) : null}

      {expanded || variant === "full" ? (
        <div className="mt-4">
          <pre className="max-h-48 overflow-auto rounded-lg border border-border/60 bg-card p-3 text-[11px] leading-relaxed text-muted-foreground sm:max-h-64 sm:text-xs">
            {prompt.slice(0, 1200)}…
          </pre>
          <p className="mt-2 text-xs text-muted-foreground">
            Preview truncated — use <strong className="font-medium text-foreground">Copy prompt</strong> for the full text.
          </p>
        </div>
      ) : null}
    </section>
  );
}
