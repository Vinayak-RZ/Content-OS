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

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect(
      session.user.hasDraftProviderKey ? "/dashboard" : "/onboarding",
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Use your Google account to access your dashboard and encrypted API
          keys.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <SignInButton size="lg" callbackUrl="/dashboard" />
      </CardContent>
    </Card>
  );
}
