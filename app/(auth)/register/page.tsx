import { auth } from "@/auth";
import { AuthPanel } from "@/components/AuthPanel";
import type { AuthMode } from "@/components/AuthForm";
import { CoverMarquee } from "@/components/overdrive/CoverMarquee";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}): Promise<Metadata> {
  const { mode } = await searchParams;
  return { title: mode === "login" ? "Sign in" : "Sign up", robots: { index: false } };
}

// Only ever redirect to a same-site path — a bare "callbackUrl" straight from
// the query string could otherwise be used to bounce a signed-in user to an
// attacker-controlled URL.
function safeCallbackUrl(url?: string) {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return "/";
  return url;
}

export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; callbackUrl?: string }>;
}) {
  const { mode, callbackUrl } = await searchParams;
  const safeCallback = safeCallbackUrl(callbackUrl);

  const session = await auth();
  if (session) redirect(safeCallback);

  const initialMode: AuthMode = mode === "login" ? "login" : "signup";

  return (
    // Phones: logo header + form, no cover wall (it pushes the form below the
    // fold). Tablets and up: the cover wall beside the form, as on laptops.
    <div className="flex min-h-dvh flex-col bg-ov-bg md:grid md:min-h-screen md:grid-cols-2">
      <header className="flex h-16 items-center px-4 md:hidden">
        <Logo />
      </header>

      {/* Pinned to the viewport, so the logo and footnote stay in view when
          the form is taller than the screen. */}
      <aside aria-label="About GAME//HUB" className="relative hidden overflow-hidden md:sticky md:top-0 md:block md:h-screen">
        <div aria-hidden>
          <Suspense fallback={null}>
            <CoverMarquee />
          </Suspense>
        </div>
        {/* Darken the top and bottom edges for the logo and footnote. */}
        {/* pointer-events-none: hover must reach the columns underneath. */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(5_7_14/0.85),transparent_18%,transparent_80%,rgb(5_7_14/0.92))]" />
        <Logo className="absolute top-7 left-8" />
        {/* What the product does, as a quiet caption: the form is the headline. */}
        <p className="pointer-events-none absolute right-8 bottom-7 left-8 flex items-center gap-2.5 font-hud text-ui font-medium text-ov-text">
          <span aria-hidden className="size-2 shrink-0 bg-ov-teal" />
          Every game, every price drop, every showcase.
        </p>
      </aside>

      {/* Phones: the form is centred in the screen below the logo bar; pb-16
          mirrors the 64px bar so it sits at the true visual centre. */}
      <main className="flex flex-1 items-center justify-center px-4 pt-2 pb-16 md:min-h-screen md:border-l md:border-ov-border md:bg-ov-panel md:px-8 md:py-10">
        <AuthPanel initialMode={initialMode} callbackUrl={safeCallback} />
      </main>
    </div>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-orbitron text-lg font-extrabold tracking-[0.06em] text-ov-teal transition-opacity duration-150 hover:opacity-80 lg:text-xl ${className ?? ""}`}
    >
      GAME<span className="text-ov-faint">{"//"}</span>HUB
    </Link>
  );
}
