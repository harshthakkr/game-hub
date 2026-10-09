import type { MetadataRoute } from "next";

/// Top-level pages. Game and event pages are reached by crawling from these;
/// listing every IGDB title here would mean a sitemap of 200k+ URLs.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return ["", "/games", "/events", "/platforms", "/genres", "/developers", "/ai", "/design"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" || path === "/events" ? "hourly" : "daily",
  }));
}
