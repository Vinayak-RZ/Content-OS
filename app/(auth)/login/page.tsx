import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GuestEnterButton } from "@/components/auth/guest-enter-button";
import { SignInButton } from "@/components/auth/sign-in-button";
import { JsonLd } from "@/components/seo/json-ld";
import { buildLoginJsonLd } from "@/lib/seo/json-ld-schemas";
import { loginPageMetadata } from "@/lib/seo/metadata";
import { getSession } from "@/lib/session";

export const metadata: Metadata = loginPageMetadata;

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect(
      session.user.onboardingCompleted ? "/dashboard" : "/onboarding",
    );
  }

  return (
    <>
      <JsonLd data={buildLoginJsonLd()} />
      <Card className="shadow-ambient">
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-2xl">Get started</CardTitle>
        <CardDescription className="text-base">
          Sign in with Google to save your work, or try the app as a guest - no
          account required.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-8">
        <SignInButton size="lg" callbackUrl="/dashboard" className="w-full" />
        <GuestEnterButton className="w-full" />
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By continuing, you agree to use Content OS for your own content
          workflow. We never post on your behalf.
        </p>
      </CardContent>
    </Card>
    </>
  );
}
