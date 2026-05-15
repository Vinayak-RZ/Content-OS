import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      /** True when OpenRouter or NVIDIA NIM key is configured for drafts. */
      hasDraftProviderKey?: boolean;
      hasTavilyKey?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    hasDraftProviderKey?: boolean;
    hasTavilyKey?: boolean;
  }
}
