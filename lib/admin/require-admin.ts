import { ApiError } from "@/lib/api-error";

function readAdminSecret(): string | null {
  const raw = process.env["ADMIN_SECRET"];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length >= 32 ? trimmed : null;
}

/** Throws if Authorization header does not match ADMIN_SECRET. */
export function requireAdminSecret(request: Request): void {
  const configured = readAdminSecret();
  if (!configured) {
    throw new ApiError(
      "ADMIN_NOT_CONFIGURED",
      "ADMIN_SECRET is not configured on the server.",
      503,
    );
  }

  const auth = request.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  if (!token || token !== configured) {
    throw new ApiError("UNAUTHORIZED", "Invalid or missing admin credentials.", 401);
  }
}

export function isAdminConfigured(): boolean {
  return readAdminSecret() !== null;
}
