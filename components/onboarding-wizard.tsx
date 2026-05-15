"use client";

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
import { DraftProviderFields } from "@/components/draft-provider-fields";
import type { SettingsResponse } from "@/lib/user-settings";
import {
  discoveryKeysPatchFromForm,
  draftKeysPatchFromForm,
  hasDraftKeyInForm,
} from "@/lib/settings-keys";

const STEPS = [
  { id: 1, title: "API keys", required: true },
  { id: 2, title: "Context files", required: false },
  { id: 3, title: "Interests", required: false },
  { id: 4, title: "First discovery", required: false },
] as const;

interface OnboardingWizardProps {
  initial: SettingsResponse;
}

export function OnboardingWizard({ initial }: OnboardingWizardProps) {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  const progress = (step / STEPS.length) * 100;

  async function saveKeys(form: FormData) {
    setIsSaving(true);
    setError(null);
    if (!hasDraftKeyInForm(form, initial.keys)) {
      setError(
        "Add an OpenRouter or NVIDIA NIM API key to continue (one is required).",
      );
      setIsSaving(false);
      return;
    }
    const patch: Record<string, string> = {
      ...draftKeysPatchFromForm(form),
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

  function finish() {
    router.push("/dashboard");
    router.refresh();
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
              Connect a draft provider (OpenRouter or NVIDIA NIM). Tavily and
              Firecrawl power discovery in later phases.
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
              <DraftProviderFields
                openrouterConfigured={initial.keys.openrouter}
                nvidiaConfigured={initial.keys.nvidia}
                requireOne
              />
              <KeyInput
                id="tavilyApiKey"
                label="Tavily"
                configured={initial.keys.tavily}
              />
              <KeyInput
                id="firecrawlApiKey"
                label="Firecrawl"
                configured={initial.keys.firecrawl}
              />
              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}
              <Button type="submit" size="lg" disabled={isSaving}>
                {isSaving ? "Saving…" : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Context files</CardTitle>
            <CardDescription>
              Copy the six canonical founder markdown files into your workspace
              and chunk + embed them (requires{" "}
              <span className="font-medium">OPENAI_API_KEY</span> for{" "}
              <code className="text-xs">text-embedding-3-small</code>). You can
              edit everything later under{" "}
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
              base. You will refine them in the Knowledge editor (Phase 2).
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
            <CardTitle>Run first discovery</CardTitle>
            <CardDescription>
              Discovery adapters arrive in Phase 3. Your daily cron and manual
              refresh will populate topic cards on the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={finish}>
              Go to dashboard
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
  required,
}: {
  id: string;
  label: string;
  configured: boolean;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>
          {label}
          {required ? <span className="text-brand"> *</span> : null}
        </Label>
        {configured ? (
          <span className="text-xs text-brand">Configured</span>
        ) : null}
      </div>
      <Input
        id={id}
        name={id}
        type="password"
        autoComplete="off"
        required={required && !configured}
        placeholder={configured ? "Leave blank to keep" : "Paste API key"}
      />
    </div>
  );
}
