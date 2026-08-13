import type { Metadata } from "next";
import { GoogleLoginButton } from "@/components/auth/google-button";
import { Logo } from "@/components/common/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <Logo size="lg" />
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome to FlowDesk</CardTitle>
          <CardDescription>Sign in with your Google account to continue.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <GoogleLoginButton />
          <Separator />
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to the FlowDesk terms. Your first sign-in creates your
            account automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
