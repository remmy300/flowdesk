"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-context";
import { Spinner } from "@/components/common/loader";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function GoogleLoginButton() {
  const { googleLogin } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const handleCredential = async (response: { credential?: string }) => {
      if (!response.credential || busyRef.current) return;
      busyRef.current = true;
      try {
        await googleLogin(response.credential);
        toast.success("Signed in");
        router.push("/");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      } finally {
        busyRef.current = false;
      }
    };

    const init = () => {
      if (cancelled || !window.google?.accounts) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        auto_select: false,
        callback: handleCredential,
      });
      window.google.accounts.id.disableAutoSelect();
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 320,
        });
      }
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = init;
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [googleLogin, router]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-center text-sm text-amber-700">
        Google sign-in is not configured. Set{" "}
        <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in{" "}
        <code className="rounded bg-amber-100 px-1">client/.env.local</code>.
      </p>
    );
  }

  return (
    <div className="flex justify-center">
      <div ref={buttonRef} />
      <span className="sr-only">
        <Spinner />
      </span>
    </div>
  );
}
