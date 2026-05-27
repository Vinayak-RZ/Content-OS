import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInButton } from "@/components/auth/sign-in-button";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Content OS with Google to access your topic board, knowledge base, and drafts.",
  robots: { index: true, follow: true },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect(
      session.user.onboardingCompleted ? "/dashboard" : "/onboarding",
    );
  }

  return (
    <Card className="shadow-ambient">
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-2xl">Welcome back</CardTitle>
        <CardDescription className="text-base">
          Sign in with Google to access your topic board, drafts, and encrypted
          settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pb-8">
        <SignInButton size="lg" callbackUrl="/dashboard" className="w-full" />
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By continuing, you agree to use Content OS for your own content
          workflow. We never post on your behalf.
        </p>
      </CardContent>
    </Card>
  );
}
