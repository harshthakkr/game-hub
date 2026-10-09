import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STORES, formatPrice } from "@/lib/prices";
import { publicJson } from "@/lib/http";

const RANGES = { "24h": 24, "7d": 24 * 7, "30d": 24 * 30 } as const;
type Range = keyof typeof RANGES;

/// Price history for every store a game is tracked on, one series per store,
/// so the chart can overlay them.
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;
  const rangeParam = request.nextUrl.searchParams.get("range") ?? "24h";
  const range: Range = rangeParam in RANGES ? (rangeParam as Range) : "24h";
  const since = new Date(Date.now() - RANGES[range] * 60 * 60 * 1000);

  const listings = await prisma.priceListing.findMany({
    where: { gameSlug: slug },
    orderBy: { store: "asc" },
  });
  if (listings.length === 0) {
    return NextResponse.json({ error: "No price history for this game" }, { status: 404 });
  }

  const series = await Promise.all(
    listings.map(async (listing) => {
      const [snapshots, previous] = await Promise.all([
        prisma.priceSnapshot.findMany({
          where: { listingId: listing.id, fetchedAt: { gte: since } },
          orderBy: { fetchedAt: "asc" },
        }),
        // The last sample before the window tells us what the price was at its
        // start, so a line can be drawn even if nothing was sampled inside it.
        prisma.priceSnapshot.findFirst({
          where: { listingId: listing.id, fetchedAt: { lt: since } },
          orderBy: { fetchedAt: "desc" },
        }),
      ]);
      const latest = snapshots.at(-1) ?? previous;
      const currency = latest?.currency ?? "INR";
      return {
        store: listing.store,
        label: STORES[listing.store].label,
        productName: listing.productName,
        url: STORES[listing.store].url(listing.externalId),
        currency,
        lastFetchedAt: listing.lastFetchedAt,
        lastError: listing.lastError,
        current: latest
          ? {
              price: latest.price,
              basePrice: latest.basePrice,
              isFree: latest.isFree,
              formatted: latest.isFree ? "Free" : formatPrice(latest.price, currency),
              saleEndsAt: latest.saleEndsAt,
            }
          : null,
        previous: previous ? { t: previous.fetchedAt, price: previous.price } : null,
        points: snapshots.map((s) => ({ t: s.fetchedAt, price: s.price, basePrice: s.basePrice })),
      };
    })
  );

  // Prices are checked every 3 hours at most; a 5-minute shared copy is plenty.
  return publicJson({ range, series }, 300);
};
