import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      /** True when any draft provider key is configured. */
      hasDraftProviderKey?: boolean;
      hasTavilyKey?: boolean;
      onboardingCompleted?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    hasDraftProviderKey?: boolean;
    hasTavilyKey?: boolean;
    onboardingCompleted?: boolean;
  }
}
