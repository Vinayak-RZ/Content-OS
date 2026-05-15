"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      emailDigest: form.get("emailDigest") === "on",
    };
    if (!hasDraftKeyInForm(form, settings.keys)) {
      setError(
        "At least one draft provider key is required (OpenRouter or NVIDIA NIM).",
      );
      return;
    }
    Object.assign(
      patch,
      draftKeysPatchFromForm(form),
      discoveryKeysPatchFromForm(form, {
        tavily: "tavilyApiKey",
        firecrawl: "firecrawlApiKey",
      }),
    );
    void save(patch);
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{settings.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="emailDigest"
              defaultChecked={settings.emailDigest}
              className="size-4 rounded border-input accent-brand"
            />
            Daily digest email after discovery
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Draft generation</CardTitle>
          <CardDescription>
            Stored encrypted. Leave blank to keep existing keys. If both are set,
            OpenRouter is used
            {settings.draftProvider
              ? ` (currently ${settings.draftProvider === "openrouter" ? "OpenRouter" : "NVIDIA NIM"}).`
              : "."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DraftProviderFields
            openrouterConfigured={settings.keys.openrouter}
            nvidiaConfigured={settings.keys.nvidia}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discovery</CardTitle>
          <CardDescription>
            Optional until Phase 3. Values are never shown again after save.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <KeyField
            id="tavilyApiKey"
            label="Tavily"
            configured={settings.keys.tavily}
          />
          <KeyField
            id="firecrawlApiKey"
            label="Firecrawl"
            configured={settings.keys.firecrawl}
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

function KeyField({
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
        ) : (
          <span className="text-xs text-muted-foreground">Not set</span>
        )}
      </div>
      <Input
        id={id}
        name={id}
        type="password"
        autoComplete="off"
        placeholder={configured ? "••••••••••••••••" : "Paste API key"}
      />
    </div>
  );
}
