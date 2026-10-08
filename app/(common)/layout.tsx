"use client";

import { SessionProvider } from "next-auth/react";
import { CollectionProvider } from "@/context/CollectionContext";
import { PageShell } from "@/components/overdrive/PageShell";
import { TopBar } from "@/components/overdrive/TopBar";
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
            <PageShell>
              <TopBar />
              <main>{children}</main>
            </PageShell>
          </CommandPaletteProvider>
        </CollectionProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
