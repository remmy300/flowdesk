"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { authApi } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /**
   * True when Clerk has an active session, regardless of whether the backend
   * `User` row has been resolved yet. Guards use this to avoid redirect loops
   * while `authApi.me()` is still in flight (or the server isn't configured).
   */
  hasSession: boolean;
  /** Legacy GoogleID-token login. Kept for backward compatibility. */
  googleLogin: (idToken: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Clerk session state. `isLoaded` gates the initial hydration so we don't
  // briefly report "logged out" while Clerk is still booting.
  const { isLoaded: clerkLoaded, isSignedIn, signOut } = useClerkAuth();

  const refresh = useCallback(async () => {
    try {
      // `authApi.me()` is authed by the Clerk bearer token (see lib/api.ts) or,
      // failing that, the legacy httpOnly cookie. Either way we get the local
      // User row (DB id + role) that the rest of the app expects.
      const { user } = await authApi.me();
      setUser(user);
    } catch {
      setUser(null);
    }
  }, []);

  // Re-hydrate whenever Clerk finishes loading or the sign-in state flips.
  useEffect(() => {
    if (!clerkLoaded) return;
    refresh().finally(() => setIsLoading(false));
  }, [clerkLoaded, isSignedIn, refresh]);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  const googleLogin = useCallback(async (idToken: string) => {
    const { user } = await authApi.googleLogin(idToken);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout().catch(() => {});
      if (isSignedIn) await signOut();
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  }, [router, isSignedIn, signOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasSession: !!isSignedIn,
        googleLogin,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
