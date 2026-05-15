import Link from "next/link";
import { redirect } from "next/navigation";
import { HomeHero } from "@/components/home-hero";
import { SignInButton } from "@/components/auth/sign-in-button";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect(
      session.user.hasDraftProviderKey ? "/dashboard" : "/onboarding",
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <span className="text-xs font-bold">C</span>
          </span>
          <span className="text-lg font-semibold tracking-tight">Content OS</span>
        </Link>
        <SignInButton variant="outline" callbackUrl="/dashboard" />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <HomeHero />
      </main>
    </div>
  );
}
