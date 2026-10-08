import axios from "axios";
import { NextResponse } from "next/server";
import { getIgdbHeaders } from "@/lib/igdb";
import { bestPrices } from "@/lib/deals";

const LIMIT = 12;

/// Tracked games currently on sale, deepest discount first. "Tracked" means
/// someone viewed or collected the game recently, so this is a window onto
/// what players here care about, not every sale on either store.
export const GET = async () => {
  try {
    const prices = await bestPrices();
    const onSale = [...prices.entries()]
      .filter(([, p]) => p.discountPercent > 0)
      .sort(([, a], [, b]) => b.discountPercent - a.discountPercent)
      .slice(0, LIMIT);
    if (onSale.length === 0) return NextResponse.json([]);

    const headers = await getIgdbHeaders();
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/games`,
      `fields id,name,slug,cover.url,first_release_date,genres.name; where id = (${onSale
        .map(([id]) => id)
        .join(",")}); limit ${LIMIT};`,
      { headers }
    );
    const byId = new Map((data as { id: number }[]).map((g) => [g.id, g]));
    return NextResponse.json(
      onSale.flatMap(([id, price]) => (byId.has(id) ? [{ ...byId.get(id), price }] : []))
    );
  } catch {
    return NextResponse.json({ error: "Failed to load deals" }, { status: 500 });
  }
};
