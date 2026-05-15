import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";

export async function getSession() {
  return getServerSession(getAuthOptions());
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new ApiError("UNAUTHORIZED", "Authentication required", 401);
  }
  return session;
}
