"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-context";
import { FullScreenLoader } from "@/components/common/loader";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasSession } = useAuth();
  const router = useRouter();

  // Only redirect to /login when we're certain there's no session at all.
  // If Clerk reports a session but the backend user hasn't resolved yet
  // (or the server isn't configured), wait instead of bouncing — otherwise
  // Clerk would redirect straight back here and we'd loop.
  const definitelyLoggedOut = !isLoading && !isAuthenticated && !hasSession;

  useEffect(() => {
    if (definitelyLoggedOut) {
      router.replace("/login");
    }
  }, [definitelyLoggedOut, router]);

  if (isAuthenticated) return <>{children}</>;
  return <FullScreenLoader />;
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Don't mount the sign-in UI while a Clerk session exists (it would trigger
  // Clerk's "already signed in" redirect and flicker) — show a loader until the
  // backend user resolves and the effect above redirects home.
  if (isLoading || isAuthenticated || hasSession) return <FullScreenLoader />;
  return <>{children}</>;
}
