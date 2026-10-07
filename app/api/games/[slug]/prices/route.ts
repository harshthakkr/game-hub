import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { psStoreConceptUrl } from "@/lib/psStore";
import { formatPrice } from "@/lib/prices";

const RANGES = { "24h": 24, "7d": 24 * 7, "30d": 24 * 30 } as const;
type Range = keyof typeof RANGES;

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;
  const rangeParam = request.nextUrl.searchParams.get("range") ?? "24h";
  const range: Range = rangeParam in RANGES ? (rangeParam as Range) : "24h";
  const since = new Date(Date.now() - RANGES[range] * 60 * 60 * 1000);

  const listing = await prisma.priceListing.findFirst({
    where: { gameSlug: slug, store: "PLAYSTATION" },
  });
  if (!listing) {
    return NextResponse.json({ error: "No price history for this game" }, { status: 404 });
  }

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

  return NextResponse.json({
    store: "PLAYSTATION",
    range,
    productName: listing.productName,
    url: psStoreConceptUrl(listing.externalId),
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
    points: snapshots.map((s) => ({
      t: s.fetchedAt,
      price: s.price,
      basePrice: s.basePrice,
    })),
  });
};
