"use client";

import { useState } from "react";
import { GoogleLoginButton } from "@/components/auth/google-button";
import { Separator } from "@/components/ui/separator";

/**
 * Opt-in wrapper for the pre-Clerk Google sign-in. Rendering `<GoogleLoginButton>`
 * loads Google's Identity Services script and calls `initialize()`, so we only
 * mount it once the user explicitly asks for it — keeping it off the critical
 * path (and out of the console) for everyone using Clerk.
 */
export function LegacyGoogleLogin() {
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Use legacy Google sign-in
      </button>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Separator />
      <GoogleLoginButton />
    </div>
  );
}
