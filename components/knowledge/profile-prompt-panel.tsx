"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { CopyButton } from "@/components/ui/copy-button";
import {
  CONTENT_OS_KNOWLEDGE_FILES,
  buildProfileGenerationPrompt,
} from "@/lib/knowledge/profile-generation-prompt";
import type { PersonaType } from "@/lib/personas/types";
import { cn } from "@/lib/utils";

type ProfilePromptPanelProps = {
  className?: string;
  personaType?: PersonaType | null;
  personaCustom?: string | null;
};

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
        >
          {expanded ? "Less" : "How it works"}
          {expanded ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </button>
      </div>

      {expanded ? (
        <div className="mt-2.5 space-y-2 border-t border-brand/15 pt-2.5">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Paste into ChatGPT or Claude → answer questions (or SKIP) → paste
            each file into the matching document below → Save & re-embed.
          </p>
          <div className="flex flex-wrap gap-1">
            {CONTENT_OS_KNOWLEDGE_FILES.map((f) => (
              <span
                key={f.slug}
                className="rounded-full border border-border/60 bg-card px-2 py-0.5 text-[11px] font-medium text-foreground"
              >
                {f.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
