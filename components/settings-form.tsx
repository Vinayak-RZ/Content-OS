"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
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
import type { SettingsResponse } from "@/lib/user-settings";
import type { PersonaType } from "@/lib/personas/types";
import { PROVIDER_LINKS } from "@/lib/provider-links";
import {
  discoveryKeysPatchFromForm,
  draftSettingsPatchFromForm,
} from "@/lib/settings-keys";

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "UTC",
];

interface SettingsFormProps {
  initial: SettingsResponse;
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const { update } = useSession();
  const [settings, setSettings] = useState(initial);
  const [personaType, setPersonaType] = useState<PersonaType | null>(
    initial.personaType,
  );
  const [personaCustom, setPersonaCustom] = useState(
    initial.personaCustom ?? "",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save(patch: Record<string, unknown>) {
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        const err = data as { error?: string };
        throw new Error(err.error ?? "Failed to save settings");
      }
      setSettings(data as SettingsResponse);
      setMessage("Settings saved.");
      await update();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const patch: Record<string, unknown> = {
      timezone: String(form.get("timezone") ?? settings.timezone),
      personaType: personaType ?? undefined,
      personaCustom:
        personaType === "other" ? personaCustom.trim() || undefined : undefined,
      ...draftSettingsPatchFromForm(form),
      ...discoveryKeysPatchFromForm(form, {
        tavily: "tavilyApiKey",
        firecrawl: "firecrawlApiKey",
      }),
    };
    void save(patch);
  }

  const activeLabel = settings.activeDraftProvider
    ? `${settings.activeDraftProvider} · ${settings.activeModelDisplayName ?? settings.activeModelId}`
    : "none (add a key for your selected provider)";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{settings.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="timezone" className="text-sm font-medium">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={settings.timezone}
              className="flex h-10 w-full rounded-xl border border-input bg-card px-3 text-sm shadow-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Shapes topic discovery and how drafts are framed for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonaPicker
            value={personaType}
            customValue={personaCustom}
            onChange={(p, custom) => {
              setPersonaType(p);
              setPersonaCustom(custom);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Draft generation</CardTitle>
          <CardDescription>
            Active when generating or editing drafts:{" "}
            <span className="font-medium text-foreground">{activeLabel}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DraftProviderSettings settings={settings} showAllProviderKeys />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discovery</CardTitle>
          <CardDescription>
            Optional keys for topic discovery and URL scraping. Values are
            encrypted and never shown again after save.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {message ? (
        <p className="text-sm text-brand">{message}</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" size="lg" disabled={isSaving}>
        {isSaving ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
