"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-context";
import { FullScreenLoader } from "@/components/common/loader";

/**
 * Shown when Clerk reports a session but the backend never resolves a user
 * (usually: the API has no CLERK_SECRET_KEY, or the DB has no `clerkId` column).
 * Without this the page just spins forever and looks like a hydration bug.
 */
function StuckSession() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm font-medium">
        You&apos;re signed in with Clerk, but the API rejected the session.
      </p>
      <p className="max-w-md text-xs text-muted-foreground">
        Set <code>CLERK_SECRET_KEY</code> on the server and run{" "}
        <code>npx prisma db push</code>, then restart the API. If you recently
        changed Clerk keys, clear site data for this origin.
      </p>
    </div>
  );
}

function useStuckAfter(ms: number, active: boolean) {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    if (!active) {
      setStuck(false);
      return;
    }
    const t = setTimeout(() => setStuck(true), ms);
    return () => clearTimeout(t);
  }, [ms, active]);
  return stuck;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasSession } = useAuth();
  const router = useRouter();

  const definitelyLoggedOut = !isLoading && !isAuthenticated && !hasSession;
  const waitingOnBackend = !isLoading && !isAuthenticated && hasSession;
  const stuck = useStuckAfter(6000, waitingOnBackend);

  useEffect(() => {
    if (definitelyLoggedOut) router.replace("/login");
  }, [definitelyLoggedOut, router]);

  if (isAuthenticated) return <>{children}</>;
  if (stuck) return <StuckSession />;
  return <FullScreenLoader />;
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasSession } = useAuth();
  const router = useRouter();

  const waitingOnBackend = !isLoading && !isAuthenticated && hasSession;
  const stuck = useStuckAfter(6000, waitingOnBackend);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/");
  }, [isLoading, isAuthenticated, router]);

  if (stuck) return <StuckSession />;
  if (isLoading || isAuthenticated || hasSession) return <FullScreenLoader />;
  return <>{children}</>;
}
