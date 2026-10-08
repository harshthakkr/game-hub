"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const ScreenTitleContext = createContext<{
  title: string | null;
  setTitle: (title: string | null) => void;
} | null>(null);

/// Lets a pushed screen (game, event, developer...) put its name in the
/// phone top bar next to the back button.
export function ScreenTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | null>(null);
  return <ScreenTitleContext.Provider value={{ title, setTitle }}>{children}</ScreenTitleContext.Provider>;
}

export function useScreenTitleValue() {
  return useContext(ScreenTitleContext)?.title ?? null;
}

export function useScreenTitle(title: string | null | undefined) {
  const ctx = useContext(ScreenTitleContext);
  const setTitle = ctx?.setTitle;
  useEffect(() => {
    setTitle?.(title ?? null);
    return () => setTitle?.(null);
  }, [title, setTitle]);
}
