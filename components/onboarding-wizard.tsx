"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DraftProviderSettings } from "@/components/draft-provider-fields";
import type { SettingsResponse } from "@/lib/user-settings";
import {
  discoveryKeysPatchFromForm,
  draftSettingsPatchFromForm,
} from "@/lib/settings-keys";

const STEPS = [
  { id: 1, title: "API keys (optional)" },
  { id: 2, title: "Context files" },
  { id: 3, title: "Interests" },
  { id: 4, title: "First discovery" },
] as const;

interface OnboardingWizardProps {
  initial: SettingsResponse;
}

export function OnboardingWizard({ initial }: OnboardingWizardProps) {
  const router = useRouter();
  const { update } = useSession();
  const [settings, setSettings] = useState(initial);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  const progress = (step / STEPS.length) * 100;

  async function saveKeys(form: FormData) {
    setIsSaving(true);
    setError(null);
    const patch: Record<string, string> = {
      ...draftSettingsPatchFromForm(form),
      ...discoveryKeysPatchFromForm(form, {
        tavily: "tavilyApiKey",
        firecrawl: "firecrawlApiKey",
      }),
    };

    if (Object.keys(patch).length === 0) {
      setStep(2);
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        const err = data as { error?: string };
        throw new Error(err.error ?? "Failed to save keys");
      }
      setSettings(data as SettingsResponse);
      await update();
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function importFounderSeeds() {
    setSeeding(true);
    setSeedMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/knowledge/seed", { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        created?: string[];
        skipped?: string[];
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Import failed — check OPENAI_API_KEY");
      }
      const c = data.created?.length ?? 0;
      const s = data.skipped?.length ?? 0;
      setSeedMsg(
        c > 0
          ? `Imported ${c} file(s); ${s} were already present.`
          : `All ${s} founder files already in your workspace.`,
      );
      await update();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Seed import failed");
    } finally {
      setSeeding(false);
    }
  }

  async function finish() {
    setIsSaving(true);
    setError(null);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingCompleted: true }),
      });
      await update();
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not finish onboarding");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Step {step} of {STEPS.length} — {STEPS[step - 1]?.title}
        </p>
        <Progress value={progress} />
      </div>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect API keys</CardTitle>
            <CardDescription>
              Optional for now. You will need a draft provider key (OpenRouter,
              OpenAI, or NVIDIA NIM) when you generate your first post. Server{" "}
              <span className="font-medium">OPENAI_API_KEY</span> is still used
              for knowledge embeddings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void saveKeys(new FormData(e.currentTarget));
              }}
            >
              <DraftProviderSettings settings={settings} />
              <KeyInput
                id="tavilyApiKey"
                label="Tavily"
                configured={settings.keys.tavily}
              />
              <KeyInput
                id="firecrawlApiKey"
                label="Firecrawl"
                configured={settings.keys.firecrawl}
              />
              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button type="submit" size="lg" disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save & continue"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(2)}
                >
                  Skip for now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Context files</CardTitle>
            <CardDescription>
              Import founder knowledge files and chunk + embed them (requires{" "}
              <span className="font-medium">OPENAI_API_KEY</span> on the server).
              Edit anytime under{" "}
              <span className="font-medium">Knowledge</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {seedMsg ? (
              <p className="text-sm text-brand">{seedMsg}</p>
            ) : null}
            <Button
              type="button"
              variant="default"
              onClick={() => void importFounderSeeds()}
              disabled={seeding}
            >
              {seeding ? "Importing…" : "Import founder knowledge from repo"}
            </Button>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Skip for now
              </Button>
              <Button onClick={() => setStep(3)}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <CardHeader>
            <CardTitle>Configure interests</CardTitle>
            <CardDescription>
              Technical interests and platform context live in your knowledge
              base. Refine them in the Knowledge editor.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(4)}>
              Skip
            </Button>
            <Button onClick={() => setStep(4)}>Continue</Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card>
          <CardHeader>
            <CardTitle>Ready to explore</CardTitle>
            <CardDescription>
              Discovery and drafts are on the dashboard. Add draft API keys in{" "}
              <Link href="/settings" className="font-medium text-brand underline">
                Settings
              </Link>{" "}
              whenever you are ready to generate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="mb-3 text-sm text-red-600">{error}</p>
            ) : null}
            <Button size="lg" onClick={() => void finish()} disabled={isSaving}>
              {isSaving ? "Finishing…" : "Go to dashboard"}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function KeyInput({
  id,
  label,
  configured,
}: {
  id: string;
  label: string;
  configured: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {configured ? (
          <span className="text-xs text-brand">Configured</span>
        ) : null}
      </div>
      <Input
        id={id}
        name={id}
        type="password"
        autoComplete="off"
        placeholder={configured ? "Leave blank to keep" : "Paste API key"}
      />
    </div>
  );
}
