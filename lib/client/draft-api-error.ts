/** Format API draft errors for UI (NO_LLM_KEY → settings prompt). */

export function formatDraftApiError(json: unknown, fallback: string): string {
  if (
    json &&
    typeof json === "object" &&
    "code" in json &&
    (json as { code?: string }).code === "NO_LLM_KEY"
  ) {
    const msg =
      "error" in json && typeof (json as { error?: string }).error === "string"
        ? (json as { error: string }).error
        : fallback;
    return `${msg} Open Settings → Draft generation to add your API key.`;
  }
  if (
    json &&
    typeof json === "object" &&
    "error" in json &&
    typeof (json as { error?: string }).error === "string"
  ) {
    return (json as { error: string }).error;
  }
  return fallback;
}
