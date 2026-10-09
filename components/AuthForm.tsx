"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import { USERNAME_HINT, USERNAME_PATTERN } from "@/utils/reviews";
import { Button, FieldLabel, Input, PasswordInput } from "@/components/ui";

export type AuthMode = "signup" | "login";

export function AuthForm({
  mode,
  onToggleMode,
  callbackUrl = "/",
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
          <FieldLabel htmlFor="auth-username">Username</FieldLabel>
          <Input
            id="auth-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="neon_drifter"
            autoComplete="username"
            className="mb-1"
          />
          <p className="mb-3.5 text-label text-ov-muted">{USERNAME_HINT}</p>
        </>
      )}

      <FieldLabel htmlFor="auth-email">Email</FieldLabel>
      <Input
        id="auth-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="player@grid.io"
        autoComplete="email"
        className="mb-3.5"
      />

      <FieldLabel htmlFor="auth-password">Password</FieldLabel>
      <PasswordInput
        id="auth-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={isSignup ? "At least 8 characters" : "••••••••"}
        autoComplete={isSignup ? "new-password" : "current-password"}
        className="mb-5"
      />

      {error && (
        <div
          role="alert"
          className="animate-ov-fade-up mb-4 border border-ov-rose bg-ov-rose/8 px-3.5 py-2.5 text-xs text-ov-rose"
        >
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={busy} className="w-full">
        {isSignup ? "Create account" : "Sign in"}
      </Button>

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
          {isSignup ? "Sign in" : "Create one"}
        </button>
      </div>
    </form>
  );
}
