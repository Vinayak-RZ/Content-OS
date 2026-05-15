/** Returns true if user already has a draft key or is submitting one. */
export function hasDraftKeyInForm(
  form: FormData,
  existing: { openrouter: boolean; nvidia: boolean },
): boolean {
  const openrouter = String(form.get("openrouterKey") ?? "").trim();
  const nvidia = String(form.get("nvidiaKey") ?? "").trim();
  return (
    Boolean(openrouter) ||
    Boolean(nvidia) ||
    existing.openrouter ||
    existing.nvidia
  );
}

export function draftKeysPatchFromForm(form: FormData): Record<string, string> {
  const patch: Record<string, string> = {};
  const openrouter = String(form.get("openrouterKey") ?? "").trim();
  const nvidia = String(form.get("nvidiaKey") ?? "").trim();
  if (openrouter) patch.openrouterKey = openrouter;
  if (nvidia) patch.nvidiaKey = nvidia;
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
