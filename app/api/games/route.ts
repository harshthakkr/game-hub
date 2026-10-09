import { igdb } from "@/lib/igdb";
import { publicJson } from "@/lib/http";
import { bestPrices, withPrices } from "@/lib/deals";
import { NextRequest, NextResponse } from "next/server";
import { GameCardProps } from "@/utils/types";
import { igdbCatalogQuery, type CatalogSort } from "@/utils/catalog";

const FIELDS =
  "fields id,name,slug,cover.url,aggregated_rating,first_release_date,genres.name,hypes,platforms.abbreviation,involved_companies.developer,involved_companies.publisher,involved_companies.company.name";

const PAGE_SIZE = 40;

/// Catalogue listing. `ids` fetches specific games (wishlist, library);
/// otherwise genre/platform/year/rating/sort filter the whole IGDB catalogue
/// server-side, paged by `offset`. Games we track prices for carry `price`.
export const GET = async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const ids = params.get("ids");
  const offset = Math.max(0, Number(params.get("offset")) || 0);

  try {
    if (ids) {
      const idList = ids
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0);
      if (idList.length === 0) return NextResponse.json([]);
      const games = await igdb<GameCardProps[]>(
        "/games",
        `${FIELDS}; where id = (${idList.join(",")}); limit ${idList.length};`
      );
      return publicJson(await withPrices(games), 300);
    }

    // "On sale only" narrows to tracked games with a live discount first;
    // the IGDB filters then apply within that set.
    let saleIds: number[] | undefined;
    if (params.get("sale") === "1") {
      const prices = await bestPrices();
      saleIds = [...prices.entries()].filter(([, p]) => p.discountPercent > 0).map(([id]) => id);
      if (saleIds.length === 0) {
        if (params.get("count") === "1") return NextResponse.json({ count: 0 });
        return NextResponse.json([], { headers: { "X-Total-Count": "0" } });
      }
    }

    const { where, sort } = igdbCatalogQuery(
      {
        genre: params.get("genre") ?? undefined,
        platform: params.get("platform") ?? undefined,
        year: params.get("year") ?? undefined,
        rating: params.get("rating") ?? undefined,
        sort: (params.get("sort") ?? undefined) as CatalogSort | undefined,
      },
      saleIds
    );

    // Count only: the phone filter sheet's live "Apply · N results".
    if (params.get("count") === "1") {
      const data = await igdb<{ count?: number }>("/games/count", `where ${where};`);
      return publicJson({ count: data.count ?? 0 }, 3600);
    }

    const [games, countRes] = await Promise.all([
      igdb<GameCardProps[]>(
        "/games",
        `${FIELDS}; sort ${sort}; limit ${PAGE_SIZE}; offset ${offset}; where ${where};`
      ),
      // The total only matters for the first page's "N games" heading.
      offset === 0 ? igdb<{ count?: number }>("/games/count", `where ${where};`).catch(() => null) : null,
    ]);
    // Card prices are checked every 3 hours at most, so a 5-minute CDN copy is plenty.
    const response = publicJson(await withPrices(games), 300);
    const total = countRes?.count;
    if (typeof total === "number") response.headers.set("X-Total-Count", String(total));
    return response;
  } catch {
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
};
