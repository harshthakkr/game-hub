import { NextRequest } from "next/server";
import { igdb } from "@/lib/igdb";
import { publicJson, safeSlug } from "@/lib/http";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const slug = safeSlug((await params).slug);
  const events = await igdb<unknown[]>(
    "/events",
    `fields name,description,start_time,end_time,event_logo.url,games.id,games.name,games.slug,games.cover.url,games.aggregated_rating,games.first_release_date,games.genres.name,games.hypes,live_stream_url; where slug = "${slug}";`,
    { revalidate: 600 }
  );
  return publicJson(events[0] ?? null, 600);
};
