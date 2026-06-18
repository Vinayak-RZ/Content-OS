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
import { PersonaPicker } from "@/components/onboarding/persona-picker";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BufferSettingsCard } from "@/components/settings/buffer-settings-card";
import { KeysSummary } from "@/components/settings/keys-summary";
import { DraftProviderSettings } from "@/components/draft-provider-fields";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";
import type { SettingsResponse } from "@/lib/user-settings";
import type { PersonaType } from "@/lib/personas/types";
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
      const result = await fetchJson<SettingsResponse>("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!result.ok) throw new Error(result.error);
      setSettings(result.data);
      setMessage("Settings saved.");
      toast("Settings saved.", "success");
      await update();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      setError(msg);
      toast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const patch: Record<string, unknown> = {
      timezone: String(form.get("timezone") ?? settings.timezone),
      emailDigest: form.get("emailDigest") === "on",
      personaType: personaType ?? undefined,
      personaCustom:
        personaType === "other" ? personaCustom.trim() || undefined : undefined,
      ...draftSettingsPatchFromForm(form),
      ...discoveryKeysPatchFromForm(form, {
        tavily: "tavilyApiKey",
        firecrawl: "firecrawlApiKey",
      }),
    };
    const bufferApiKey = String(form.get("bufferApiKey") ?? "").trim();
    const bufferOrganizationId = String(
      form.get("bufferOrganizationId") ?? "",
    ).trim();
    if (bufferApiKey) patch.bufferApiKey = bufferApiKey;
    if (bufferOrganizationId) patch.bufferOrganizationId = bufferOrganizationId;
    if (form.get("clearBuffer") === "on") patch.clearBuffer = true;
    void save(patch);
  }

  const activeLabel = settings.activeDraftProvider
    ? `${settings.activeDraftProvider} · ${settings.activeModelDisplayName ?? settings.activeModelId}`
    : "none (add a key for your selected provider)";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <KeysSummary keys={settings.keys} />

      <div className="grid gap-5 lg:grid-cols-[minmax(16rem,22rem)_1fr] lg:items-stretch">
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle>Account</CardTitle>
            <CardDescription>{settings.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
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
              <p className="text-xs text-muted-foreground">
                Used for discovery schedules and timestamps in your workspace.
              </p>
            </div>

            <label className="flex cursor-pointer gap-3 rounded-xl border border-subtle bg-muted/10 p-3">
              <input
                type="checkbox"
                name="emailDigest"
                defaultChecked={settings.emailDigest}
                className="mt-0.5 size-4 accent-brand"
              />
              <span className="space-y-0.5">
                <span className="block text-sm font-medium">Weekly email digest</span>
                <span className="block text-xs leading-relaxed text-muted-foreground">
                  A short summary of new topics and draft activity.
                </span>
              </span>
            </label>

            <SignOutButton
              variant="outline"
              size="sm"
              className="mt-auto w-full"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Shapes topic discovery and how drafts are framed for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PersonaPicker
              value={personaType}
              customValue={personaCustom}
              gridCols="2"
              onChange={(p, custom) => {
                setPersonaType(p);
                setPersonaCustom(custom);
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>API keys &amp; models</CardTitle>
          <CardDescription>
            Active for drafts:{" "}
            <span className="font-medium text-foreground">{activeLabel}</span>.
            Keys are encrypted and never shown again after save.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <DraftProviderSettings
            settings={settings}
            showAllProviderKeys
            embedded
            includeDiscoveryKeys
          />
          <BufferSettingsCard settings={settings} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-subtle bg-card px-4 py-3 shadow-ambient">
        <div className="min-w-0 text-sm">
          {message ? (
            <p className="text-brand">{message}</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <p className="text-muted-foreground">
              Changes apply after you save.
            </p>
          )}
        </div>
        <Button type="submit" size="lg" disabled={isSaving} className="shrink-0">
          {isSaving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
