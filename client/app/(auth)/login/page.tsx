import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { RedirectIfAuthed } from "@/components/auth/guards";
import { LegacyGoogleLogin } from "@/components/auth/legacy-google-login";
import { Logo } from "@/components/common/logo";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <RedirectIfAuthed>
      <div className="flex flex-col items-center gap-6">
        <Logo size="lg" />

        {/* Primary auth: Clerk. Handles OAuth providers + email out of the box. */}
        <SignIn
          routing="hash"
          appearance={{ elements: { rootBox: "mx-auto", card: "shadow-sm" } }}
        />

        {/* Legacy Google sign-in — mounted only when the user opts in, so the
            Google Identity script isn't loaded on every visit. */}
        <LegacyGoogleLogin />
      </div>
    </RedirectIfAuthed>
  );
}
