"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import { USERNAME_HINT, USERNAME_PATTERN } from "@/utils/reviews";

export type AuthMode = "signup" | "login";

const fieldClass =
  "w-full border bg-ov-panel px-4 py-3 text-ui text-ov-white outline-none placeholder:text-ov-muted transition-colors duration-150 focus:border-ov-teal";

export function AuthForm({
  mode,
  onToggleMode,
  callbackUrl = "/games",
}: {
  mode: AuthMode;
  onToggleMode: () => void;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const handle = username.trim().toLowerCase();
    if (isSignup && !USERNAME_PATTERN.test(handle)) {
      setError(USERNAME_HINT);
      return;
    }
    if (isSignup && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      if (isSignup) {
        await axios.post("/api/register", {
          username: handle,
          email: email.trim(),
          password,
        });
      }

      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          isSignup
            ? "Account created, but sign-in failed. Try logging in."
            : "Wrong email or password."
        );
        return;
      }

      router.refresh();
      router.push(callbackUrl);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string })?.error
        : null;
      setError(message ?? "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      {isSignup && (
        <>
          <label
            htmlFor="auth-username"
            className="mb-2 block text-label tracking-wide text-ov-dim"
          >
            USERNAME
          </label>
          <input
            id="auth-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="neon_drifter"
            autoComplete="username"
            className={`${fieldClass} mb-1 border-ov-border`}
          />
          <p className="mb-3.5 text-micro text-ov-muted">{USERNAME_HINT}</p>
        </>
      )}

      <label
        htmlFor="auth-email"
        className="mb-2 block text-label tracking-wide text-ov-dim"
      >
        EMAIL
      </label>
      <input
        id="auth-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="player@grid.io"
        autoComplete="email"
        className={`${fieldClass} mb-3.5 border-ov-border`}
      />

      <label
        htmlFor="auth-password"
        className="mb-2 block text-label tracking-wide text-ov-dim"
      >
        PASSWORD
      </label>
      <input
        id="auth-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••••"
        autoComplete={isSignup ? "new-password" : "current-password"}
        className={`${fieldClass} mb-5 border-ov-border`}
      />

      {error && (
        <div className="animate-ov-fade-up mb-4 border border-ov-rose bg-ov-rose/8 px-3.5 py-2.5 text-xs text-ov-rose">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="ov-chamfer-x w-full border border-ov-teal bg-ov-teal/6 px-4 py-3.5 font-orbitron text-ui font-bold tracking-hud-wide text-ov-teal transition-all duration-150 hover:bg-ov-teal/14 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
      >
        {busy ? "..." : isSignup ? "CREATE ACCOUNT" : "LOG IN"}
      </button>

      <div className="mt-5 text-center text-xs text-ov-muted">
        {isSignup ? "Already have an account? " : "Need an account? "}
        <button
          type="button"
          onClick={() => {
            onToggleMode();
            setError(null);
          }}
          className="text-ov-teal transition-colors duration-150 hover:text-ov-white hover:underline"
        >
          {isSignup ? "Log in" : "Sign up"}
        </button>
      </div>
    </form>
  );
}
