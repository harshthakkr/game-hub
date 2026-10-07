import axios from "axios";

// The PS Store has no public price API, and its GraphQL endpoint only accepts
// whitelisted persisted queries. Concept pages, however, are server-rendered
// with their Apollo cache embedded as JSON — including the price of every
// purchasable edition — so one plain GET gives us everything we need.

const LOCALE = "en-in";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";

export interface PsStorePrice {
  productName: string | null;
  currency: string;
  /// Whole currency units (INR is quoted without paise).
  basePrice: number;
  price: number;
  isFree: boolean;
  saleEndsAt: Date | null;
}

interface CachedPrice {
  basePriceValue: number;
  discountedValue: number;
  currencyCode: string;
  isFree: boolean;
  isTiedToSubscription: boolean;
  endTime: string | null;
}

interface GameCta {
  __typename: "GameCTA";
  type?: string;
  price?: CachedPrice;
  action?: { param?: { name: string; value: string }[] };
}

type ApolloCache = Record<string, Record<string, unknown>>;

export function psStoreConceptUrl(conceptId: string) {
  return `https://store.playstation.com/${LOCALE}/concept/${conceptId}`;
}

function parseScripts(html: string, idPattern: string): ApolloCache[] {
  const re = new RegExp(
    `<script id="${idPattern}"[^>]*type="application/json"[^>]*>([\\s\\S]*?)</script>`,
    "g"
  );
  const caches: ApolloCache[] = [];
  for (const match of html.matchAll(re)) {
    try {
      const json = JSON.parse(match[1]);
      // __NEXT_DATA__ nests its cache under props; the per-widget "env:" blobs
      // keep theirs under `cache`.
      const cache = json?.props?.apolloState ?? json?.cache;
      if (cache) caches.push(cache);
    } catch {
      // A malformed widget blob shouldn't sink the whole page.
    }
  }
  return caches;
}

/// Fetches the current PS Store India price for a concept. Returns null when
/// the concept isn't sold in India; throws on network or parse failures so the
/// caller can record the error.
export async function fetchPsStorePrice(
  conceptId: string
): Promise<PsStorePrice | null> {
  const res = await axios.get<string>(psStoreConceptUrl(conceptId), {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-IN" },
    responseType: "text",
    timeout: 10000,
  });
  // Unknown or region-locked concepts redirect to /en-in/error?...
  const finalUrl: string | undefined = res.request?.res?.responseUrl;
  if (finalUrl?.includes("/error")) return null;

  const html = res.data;
  const [nextData] = parseScripts(html, "__NEXT_DATA__");
  const widgets = parseScripts(html, "env:[^\"]+");

  const concept = Object.entries(nextData ?? {}).find(([key]) =>
    key.startsWith(`Concept:${conceptId}`)
  )?.[1] as { name?: string; defaultProduct?: { __ref?: string } } | undefined;
  if (!concept) return null;
  // Refs look like "Product:EP9000-PPSA08330_00-GOWRAGNAROK00000:en-in".
  const defaultProductId = concept.defaultProduct?.__ref?.split(":")[1];

  // Every edition on the page has a purchase CTA carrying its price. PS Plus
  // upsells ("Included", "Game Trial") are subscription prices, not the
  // game's, so they're skipped.
  const ctas: { skuId: string; price: CachedPrice }[] = [];
  let productName: string | null = null;
  for (const cache of widgets) {
    for (const [key, value] of Object.entries(cache)) {
      if (key === `Product:${defaultProductId}` && typeof value.name === "string") {
        productName = value.name;
      }
      const cta = value as unknown as GameCta;
      if (cta.__typename !== "GameCTA" || !cta.price) continue;
      if (cta.type?.startsWith("UPSELL") || cta.price.isTiedToSubscription) continue;
      const skuId = cta.action?.param?.find((p) => p.name === "skuId")?.value ?? "";
      ctas.push({ skuId, price: cta.price });
    }
  }
  if (ctas.length === 0) return null;

  // Prefer the standard edition the store itself headlines; otherwise the
  // cheapest edition is the closest stand-in.
  const chosen =
    ctas.find((c) => defaultProductId && c.skuId.startsWith(`${defaultProductId}-`)) ??
    ctas.reduce((min, c) =>
      c.price.discountedValue < min.price.discountedValue ? c : min
    );
  const { price } = chosen;

  return {
    productName: productName ?? concept.name ?? null,
    currency: price.currencyCode,
    basePrice: price.isFree ? 0 : price.basePriceValue,
    price: price.isFree ? 0 : price.discountedValue,
    isFree: price.isFree,
    saleEndsAt: price.endTime ? new Date(Number(price.endTime)) : null,
  };
}
