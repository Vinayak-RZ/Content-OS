/** Client-side helpers for settings / onboarding forms. */

import type { DraftProviderKind } from "@/lib/llm/models";

export type DraftKeyFlags = {
  openrouter: boolean;
  nvidia: boolean;
  openai: boolean;
};

export function hasAnyDraftKeyInForm(
  form: FormData,
  existing: DraftKeyFlags,
): boolean {
  const openrouter = String(form.get("openrouterKey") ?? "").trim();
  const nvidia = String(form.get("nvidiaKey") ?? "").trim();
  const openai = String(form.get("openaiKey") ?? "").trim();
  return (
    Boolean(openrouter) ||
    Boolean(nvidia) ||
    Boolean(openai) ||
    existing.openrouter ||
    existing.nvidia ||
    existing.openai
  );
}

export function draftSettingsPatchFromForm(
  form: FormData,
): Record<string, string> {
  const patch: Record<string, string> = {};
  const openrouter = String(form.get("openrouterKey") ?? "").trim();
  const nvidia = String(form.get("nvidiaKey") ?? "").trim();
  const openai = String(form.get("openaiKey") ?? "").trim();
  const draftProvider = String(form.get("draftProvider") ?? "").trim();
  const draftModelId = String(form.get("draftModelId") ?? "").trim();

  if (openrouter) patch.openrouterKey = openrouter;
  if (nvidia) patch.nvidiaKey = nvidia;
  if (openai) patch.openaiKey = openai;
  if (draftProvider) patch.draftProvider = draftProvider;
  if (draftModelId) patch.draftModelId = draftModelId;
  return patch;
}

export function discoveryKeysPatchFromForm(
  form: FormData,
  fieldNames: { tavily: string; firecrawl: string },
): Record<string, string> {
  const patch: Record<string, string> = {};
  const tavily = String(form.get(fieldNames.tavily) ?? "").trim();
  const firecrawl = String(form.get(fieldNames.firecrawl) ?? "").trim();
  if (tavily) patch.tavilyApiKey = tavily;
  if (firecrawl) patch.firecrawlApiKey = firecrawl;
  return patch;
}

export function parseDraftProviderFromForm(
  form: FormData,
): DraftProviderKind | null {
  const raw = String(form.get("draftProvider") ?? "").trim();
  if (raw === "openrouter" || raw === "openai" || raw === "nvidia") {
    return raw;
  }
  return null;
}
