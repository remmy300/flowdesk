import type { Metadata } from "next";

import { SignIn } from "@clerk/nextjs";
import { RedirectIfAuthed } from "@/components/auth/guards";
import { Logo } from "@/components/common/logo";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <RedirectIfAuthed>
      <div className="flex flex-col items-center gap-6">
        <Logo size="lg" />

        <SignIn
          routing="hash"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-sm",
            },
          }}
        />
      </div>
    </RedirectIfAuthed>
  );
}
