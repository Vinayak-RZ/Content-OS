export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export function formatFetchError(error: unknown, fallback: string): string {
  if (error instanceof NetworkError) return error.message;
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "Network issue. Check your connection and try again.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ ok: true; data: T; response: Response } | { ok: false; error: string; status: number }> {
  try {
    const response = await fetch(input, init);
    const json: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err =
        typeof json === "object" &&
        json &&
        "error" in json &&
        typeof (json as { error?: string }).error === "string"
          ? (json as { error: string }).error
          : response.statusText || "Request failed";
      return { ok: false, error: err, status: response.status };
    }
    return { ok: true, data: json as T, response };
  } catch (error) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return {
        ok: false,
        error: "You appear to be offline. Reconnect and try again.",
        status: 0,
      };
    }
    return {
      ok: false,
      error: formatFetchError(error, "Network issue. Try again."),
      status: 0,
    };
  }
}
