"use client";

import { SessionProvider } from "next-auth/react";
import { CollectionProvider } from "@/context/CollectionContext";
import { PageShell } from "@/components/overdrive/PageShell";
import { BottomTabBar, TopBar } from "@/components/overdrive/TopBar";
import { ScreenTitleProvider } from "@/components/overdrive/ScreenTitle";
import { CommandPaletteProvider } from "@/components/overdrive/CommandPalette";
import { ToastProvider } from "@/components/ui/Toast";

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
                <TopBar />
                {/* Clear the phone tab bar (64px + safe area). */}
                <main className="pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
                <BottomTabBar />
              </PageShell>
            </ScreenTitleProvider>
          </CommandPaletteProvider>
        </CollectionProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
