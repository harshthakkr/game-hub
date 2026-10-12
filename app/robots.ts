import type { MetadataRoute } from "next";

/// AI crawlers that scrape for training or answer engines. With 300k+ game
/// pages they can walk the whole catalogue, and every page they trigger is a
/// billed ISR write; they bring no visitors. Search engines (Google, Bing,
/// Apple, DuckDuckGo) stay allowed. Only well-behaved bots read this file;
/// Vercel's Firewall can block the rest.
const AI_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "PerplexityBot",
  "cohere-ai",
  "Diffbot",
  "Omgilibot",
  "Timpibot",
  "ImagesiftBot",
];

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/register", "/wishlist", "/library"] },
      { userAgent: AI_CRAWLERS, disallow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
