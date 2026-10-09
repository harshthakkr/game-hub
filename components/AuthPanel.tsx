"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SignIn } from "@/components/SignIn";
import { AuthForm, type AuthMode } from "@/components/AuthForm";

export function AuthPanel({
  initialMode,
  callbackUrl = "/",
}: {
  initialMode: AuthMode;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setModeState] = useState<AuthMode>(initialMode);
  const isSignup = mode === "signup";

  // Keep ?mode= in sync so a refresh or a shared link lands on the same form.
  const setMode = (next: AuthMode) => {
    setModeState(next);
    const query = new URLSearchParams(params);
    query.set("mode", next);
    router.replace(`?${query}`, { scroll: false });
  };

  return (
    <div className="flex w-full max-w-[400px] animate-ov-fade-up flex-col gap-5">
      <div className="flex flex-col gap-3">
        <p className="font-hud text-label font-semibold tracking-[0.18em] text-ov-teal">
          {isSignup ? "JOIN THE GRID" : "WELCOME BACK"}
        </p>
        <h1 className="font-orbitron text-[30px] leading-none font-bold tracking-[0.04em] uppercase lg:text-[36px]">
          {isSignup ? "Sign up" : "Sign in"}
        </h1>
        <p className="text-body leading-normal text-ov-dim">
          {isSignup
            ? "Track prices on PlayStation Store and Steam, and keep your wishlist and library in sync."
            : "Pick up where you left off: your library, wishlist and reviews are waiting."}
        </p>
      </div>

      <SignIn label={isSignup ? "Sign up with Google" : "Sign in with Google"} callbackUrl={callbackUrl} />

      <div className="flex items-center gap-3 font-hud text-label font-semibold tracking-[0.18em] text-ov-muted">
        <span className="h-px flex-1 bg-ov-border" />
        OR
        <span className="h-px flex-1 bg-ov-border" />
      </div>

      <AuthForm mode={mode} onToggleMode={() => setMode(isSignup ? "login" : "signup")} callbackUrl={callbackUrl} />

      <Link href="/" className="text-center text-ui text-ov-muted hover:text-ov-text">
        Continue browsing without an account
      </Link>
    </div>
  );
}
