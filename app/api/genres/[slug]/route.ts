import { NextRequest } from "next/server";
import { igdb } from "@/lib/igdb";
import { publicJson, safeSlug } from "@/lib/http";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const slug = safeSlug((await params).slug);
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset")) || 0);
  const games = await igdb(
    "/games",
    `fields id,name,slug,cover.url,aggregated_rating,first_release_date,genres.name,hypes,involved_companies.developer,involved_companies.publisher,involved_companies.company.name; where genres.slug = "${slug}" & cover != null; sort aggregated_rating desc; limit 40; offset ${offset};`
  );
  return publicJson(games, 3600);
};
