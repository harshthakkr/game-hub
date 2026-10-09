import { NextRequest } from "next/server";
import { igdb } from "@/lib/igdb";
import { publicJson, safeSlug } from "@/lib/http";
import { sortClause, type CatalogSort } from "@/utils/catalog";

const FIELDS =
  "fields id,name,slug,cover.url,aggregated_rating,first_release_date,genres.name,hypes,involved_companies.developer,involved_companies.publisher,involved_companies.company.name";

/// Games in one genre, paged by `offset`, sorted server-side by `sort` (same
/// options as the catalogue; Popularity by default), so infinite scroll
/// appends in order instead of reshuffling what's already loaded.
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const slug = safeSlug((await params).slug);
  const search = request.nextUrl.searchParams;
  const offset = Math.max(0, Number(search.get("offset")) || 0);
  const { order, where } = sortClause((search.get("sort") ?? undefined) as CatalogSort | undefined);
  const extra = where.map((w) => ` & ${w}`).join("");
  const games = await igdb(
    "/games",
    `${FIELDS}; where genres.slug = "${slug}" & cover != null${extra}; sort ${order}; limit 40; offset ${offset};`
  );
  return publicJson(games, 3600);
};
