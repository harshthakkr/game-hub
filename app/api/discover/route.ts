import axios from "axios";
import { NextResponse } from "next/server";
import { getIgdbHeaders } from "@/lib/igdb";
import { withPrices } from "@/lib/deals";

const CARD_FIELDS =
  "fields id,name,slug,cover.url,aggregated_rating,first_release_date,genres.name,hypes,involved_companies.developer,involved_companies.company.name";
const DAY = 24 * 60 * 60;

/// Everything the Discover page needs from IGDB in one round trip: a hero
/// carousel of recent, well-rated games that have landscape key art, trending
/// rows (by hype and by rating) and the latest releases.
export const GET = async () => {
  const headers = await getIgdbHeaders();
  const now = Math.floor(Date.now() / 1000);
  const igdb = (body: string) =>
    axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/games`, body, { headers }).then((r) => r.data);

  try {
    const [hero, byHype, byRating, releases] = await Promise.all([
      igdb(
        `${CARD_FIELDS},summary,artworks.url,artworks.width,artworks.height,screenshots.url,screenshots.width,screenshots.height,platforms.abbreviation,videos.video_id; where artworks != null & aggregated_rating >= 80 & first_release_date >= ${now - 540 * DAY} & first_release_date <= ${now}; sort hypes desc; limit 5;`
      ),
      igdb(
        `${CARD_FIELDS}; where cover != null & hypes != null & first_release_date >= ${now - 365 * DAY}; sort hypes desc; limit 12;`
      ),
      igdb(
        `${CARD_FIELDS}; where cover != null & aggregated_rating != null & aggregated_rating_count >= 5 & first_release_date >= ${now - 365 * DAY} & first_release_date <= ${now}; sort aggregated_rating desc; limit 12;`
      ),
      igdb(
        `${CARD_FIELDS}; where cover != null & first_release_date <= ${now} & first_release_date >= ${now - 60 * DAY} & hypes >= 5; sort first_release_date desc; limit 6;`
      ),
    ]);

    const [heroP, hypeP, ratingP, releasesP] = await Promise.all(
      [hero, byHype, byRating, releases].map((list) => withPrices(list))
    );
    return NextResponse.json({
      hero: heroP,
      trending: { hype: hypeP, rating: ratingP },
      releases: releasesP,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load Discover" }, { status: 500 });
  }
};
