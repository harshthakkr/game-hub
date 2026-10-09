"use client";

import { SessionProvider } from "next-auth/react";
import { CollectionProvider } from "@/context/CollectionContext";
import { PageShell } from "@/components/overdrive/PageShell";
import { BottomTabBar, TopBar } from "@/components/overdrive/TopBar";
import { ScreenTitleProvider } from "@/components/overdrive/ScreenTitle";
import { CommandPaletteProvider } from "@/components/overdrive/CommandPalette";
import { ToastProvider } from "@/components/ui/Toast";
import { useEffect } from "react";
import { installNavMemory } from "@/utils/navMemory";

/// Back/forward restores the scroll position on pages that load their
/// content in the browser (see utils/navMemory).
function NavMemory() {
  useEffect(() => installNavMemory(), []);
  return null;
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CollectionProvider>
          <CommandPaletteProvider>
            <ScreenTitleProvider>
              <PageShell>
                <NavMemory />
                {/* First tab stop: jump past the nav. Visible only when focused. */}
                <a
                  href="#main"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-ov-teal focus:px-4 focus:py-2.5 focus:text-ui focus:font-semibold focus:text-ov-teal-ink"
                >
                  Skip to content
                </a>
                <TopBar />
                {/* Clear the phone tab bar (64px + safe area). */}
                <main id="main" tabIndex={-1} className="outline-none pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
                <BottomTabBar />
              </PageShell>
            </ScreenTitleProvider>
          </CommandPaletteProvider>
        </CollectionProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
