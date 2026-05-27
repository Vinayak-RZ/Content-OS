"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiKeyField } from "@/components/ui/api-key-field";
import { PersonaPicker } from "@/components/onboarding/persona-picker";
import { DraftProviderSettings } from "@/components/draft-provider-fields";
import { ProfilePromptPanel } from "@/components/knowledge/profile-prompt-panel";
import type { SettingsResponse } from "@/lib/user-settings";
import { PROVIDER_LINKS } from "@/lib/provider-links";
import type { PersonaType } from "@/lib/personas/types";
import {
  discoveryKeysPatchFromForm,
  draftSettingsPatchFromForm,
} from "@/lib/settings-keys";

const STEPS = [
  { id: 1, title: "About you" },
  { id: 2, title: "API keys (optional)" },
  { id: 3, title: "Knowledge files" },
  { id: 4, title: "Ready to go" },
] as const;

interface OnboardingWizardProps {
  initial: SettingsResponse;
}

export function OnboardingWizard({ initial }: OnboardingWizardProps) {
  const router = useRouter();
  const { update } = useSession();
  const [settings, setSettings] = useState(initial);
  const [step, setStep] = useState(1);
  const [personaType, setPersonaType] = useState<PersonaType | null>(
    initial.personaType,
  );
  const [personaCustom, setPersonaCustom] = useState(
    initial.personaCustom ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  const progress = (step / STEPS.length) * 100;

  async function savePersona() {
    if (!personaType) {
      setError("Pick the option that fits you best.");
      return;
    }
    if (personaType === "other" && !personaCustom.trim()) {
      setError("Tell us a bit about what you do.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaType,
          personaCustom:
            personaType === "other" ? personaCustom.trim() : undefined,
        }),
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        const err = data as { error?: string };
        throw new Error(err.error ?? "Failed to save");
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
      setStep(3);
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
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function importStarterTemplates() {
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
          ? `Imported ${c} template(s); ${s} were already present.`
          : `All ${s} templates already in your workspace.`,
      );
      await update();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
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
            <CardTitle>Tell us about you</CardTitle>
            <CardDescription>
              Content OS tailors topic discovery and drafts to your background.
              Pick the closest fit — you can change this later in Settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PersonaPicker
              value={personaType}
              customValue={personaCustom}
              onChange={(p, custom) => {
                setPersonaType(p);
                setPersonaCustom(custom);
                setError(null);
              }}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button
              type="button"
              size="lg"
              disabled={isSaving}
              onClick={() => void savePersona()}
            >
              {isSaving ? "Saving…" : "Continue"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect API keys</CardTitle>
            <CardDescription>
              Optional for now. Add a draft provider key when you&apos;re ready
              to generate posts. Each field links to where you can create a
              key.
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
              <ApiKeyField
                id="tavilyApiKey"
                label="Tavily"
                configured={settings.keys.tavily}
                provider={PROVIDER_LINKS.tavily}
              />
              <ApiKeyField
                id="firecrawlApiKey"
                label="Firecrawl"
                configured={settings.keys.firecrawl}
                provider={PROVIDER_LINKS.firecrawl}
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
                  onClick={() => setStep(3)}
                >
                  Skip for now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <ProfilePromptPanel
            personaType={settings.personaType}
            personaCustom={settings.personaCustom}
          />

          <Card>
            <CardHeader>
              <CardTitle>Set up knowledge files</CardTitle>
              <CardDescription>
                Import starter templates, then paste AI-generated content from
                the prompt above. Edit anytime under Knowledge.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {seedMsg ? (
                <p className="text-sm text-brand">{seedMsg}</p>
              ) : null}
              {error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : null}
              <Button
                type="button"
                variant="default"
                onClick={() => void importStarterTemplates()}
                disabled={seeding}
              >
                {seeding ? "Importing…" : "Import starter templates"}
              </Button>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(4)}>
                  Skip for now
                </Button>
                <Button onClick={() => setStep(4)}>Continue</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {step === 4 ? (
        <Card>
          <CardHeader>
            <CardTitle>Ready to explore</CardTitle>
            <CardDescription>
              Run discovery on the dashboard to find topics ranked to your
              profile. Add draft API keys in{" "}
              <Link href="/settings" className="font-medium text-brand underline">
                Settings
              </Link>{" "}
              whenever you&apos;re ready to generate posts.
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
