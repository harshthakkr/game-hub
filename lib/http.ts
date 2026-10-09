import { NextResponse } from "next/server";

/// JSON for public, non-personal data. The browser keeps it for up to 5
/// minutes (going back to a page reuses it with no network trip), the CDN for
/// `seconds`, and both serve it stale while refreshing in the background. So
/// repeat requests rarely reach the function, and almost never IGDB.
export function publicJson(data: unknown, seconds: number) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, max-age=${Math.min(seconds, 300)}, s-maxage=${seconds}, stale-while-revalidate=86400`,
    },
  });
}

/// IGDB slugs are [a-z0-9-]; anything else could break out of a query string.
export const safeSlug = (slug: string) => slug.replace(/[^a-z0-9-]/gi, "");
