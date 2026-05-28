"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getBuilderQuestions,
  type BuilderAnswers,
} from "@/lib/knowledge/builder-questions";
import {
  resolvePersonaLabel,
  type PersonaType,
} from "@/lib/personas/types";
import { cn } from "@/lib/utils";

type KnowledgeBuilderFormProps = {
  className?: string;
  personaType?: PersonaType | null;
  personaCustom?: string | null;
  onSuccess?: () => void;
};

export function KnowledgeBuilderForm({
  className,
  personaType = null,
  personaCustom = null,
  onSuccess,
}: KnowledgeBuilderFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<BuilderAnswers>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const questions = useMemo(
    () => getBuilderQuestions(personaType, personaCustom),
    [personaType, personaCustom],
  );

  const personaLabel = useMemo(
    () => resolvePersonaLabel(personaType, personaCustom),
    [personaType, personaCustom],
  );

  function setField(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/knowledge/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save knowledge files");
      }
      setSuccess(
        "Knowledge files saved and embedded. Discovery and drafts will use your profile.",
      );
      onSuccess?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={cn(
        "rounded-xl border border-brand/25 bg-card p-4 shadow-ambient sm:p-6",
        className,
      )}
    >
      <div className="mb-5">
        <h3 className="font-heading text-base font-semibold text-foreground">
          Build your knowledge here
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Skip anything you’re not sure about — fill in what you can. At least
          one answer is needed to save. The last two questions fit your profile
          as a{" "}
          <span className="font-medium text-foreground">{personaLabel}</span>.
        </p>
      </div>

      <div className="space-y-5">
        {questions.map((q, index) => (
          <div key={q.id} className="space-y-2">
            <Label
              htmlFor={`kb-${q.id}`}
              className="text-sm font-medium leading-snug"
            >
              <span className="mr-2 font-heading text-xs font-semibold text-brand/80">
                {String(index + 1).padStart(2, "0")}
              </span>
              {q.label}
              {q.personaOnly ? (
                <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                  Your profile
                </span>
              ) : null}
            </Label>
            {q.type === "short" ? (
              <Input
                id={`kb-${q.id}`}
                value={answers[q.id as keyof BuilderAnswers] ?? ""}
                onChange={(e) => setField(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="bg-background"
              />
            ) : (
              <Textarea
                id={`kb-${q.id}`}
                value={answers[q.id as keyof BuilderAnswers] ?? ""}
                onChange={(e) => setField(q.id, e.target.value)}
                placeholder={q.placeholder}
                rows={3}
                className="min-h-[88px] resize-y bg-background"
              />
            )}
          </div>
        ))}
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 text-sm text-brand" role="status">
          {success}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            "Save to knowledge files"
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Maps to Writing style, Soul, Interests, and Thoughts — edit anytime
          below.
        </p>
      </div>
    </form>
  );
}
