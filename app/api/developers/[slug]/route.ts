import { NextRequest } from "next/server";
import { igdb } from "@/lib/igdb";
import { publicJson, safeSlug } from "@/lib/http";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const slug = safeSlug((await params).slug);
  const companies = await igdb<unknown[]>(
    "/companies",
    `fields name,description,developed.id,developed.name,developed.slug,developed.cover.url,developed.aggregated_rating,developed.first_release_date,developed.genres.name,developed.hypes,websites.url; where slug = "${slug}";`
  );
  return publicJson(companies[0] ?? null, 3600);
};
