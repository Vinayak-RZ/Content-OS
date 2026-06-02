import { isGuestSession } from "@/lib/guest/cookie";
import { getSession } from "@/lib/session";

export type AppAccess =
  | {
      mode: "user";
      userId: string;
      onboardingCompleted: boolean;
    }
  | { mode: "guest" };

/** Signed-in user or guest cookie - null if neither. */
export async function getAppAccess(): Promise<AppAccess | null> {
  const session = await getSession();
  if (session?.user?.id) {
    return {
      mode: "user",
      userId: session.user.id,
      onboardingCompleted: Boolean(session.user.onboardingCompleted),
    };
  }
  if (await isGuestSession()) {
    return { mode: "guest" };
  }
  return null;
}
