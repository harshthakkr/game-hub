"use client";

import { usePathname } from "next/navigation";

/// usePathname, with the home page always "/". When Vercel regenerates the
/// statically cached home page (ISR), Next renders it under its internal name
/// "/index", and React keeps that server markup on hydration, so anything
/// keyed on "/" (the active nav tab, sign-in return URLs) would be wrong.
export function usePagePath() {
  const pathname = usePathname();
  return pathname === "/index" ? "/" : pathname;
}
