import { igdb, igdbNow } from "@/lib/igdb";
import { publicJson } from "@/lib/http";
import { NextRequest, NextResponse } from "next/server";

const FIELDS = "fields name,slug,event_logo.url,description,start_time,end_time";
const PAGE = 20;

/// Events for the Events page tabs, paginated with `offset`, filtered here
/// (not on the client) so "Load more" always pages through the selected tab:
/// - all (default): newest first
/// - live: started, not yet finished (no end time = one hour long, as in
///   utils/overdrive eventTiming)
/// - upcoming: live or still to come, soonest first
/// - month: starting within [from, to) — the viewer's calendar month, sent by
///   the browser so it follows their timezone
/// With `upcoming=1`, Discover's short "Live & upcoming" shelf.
export const GET = async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const offset = Math.max(0, Number(params.get("offset")) || 0);
  // Rounded to 5 minutes so the query (and its cache entry) is stable.
  const now = igdbNow();
  const page = `limit ${PAGE}; offset ${offset};`;
  const from = Number(params.get("from")) || 0;
  const to = Number(params.get("to")) || 0;

  let query: string;
  if (params.get("upcoming") === "1") {
    query = `${FIELDS}; where end_time >= ${now} | start_time >= ${now}; sort start_time asc; limit 8;`;
  } else {
    switch (params.get("status")) {
      case "live":
        query = `${FIELDS}; where start_time <= ${now} & (end_time >= ${now} | (end_time = null & start_time >= ${now - 3600})); sort start_time asc; ${page}`;
        break;
      case "upcoming":
        query = `${FIELDS}; where end_time >= ${now} | start_time >= ${now - 3600}; sort start_time asc; ${page}`;
        break;
      case "month":
        query = `${FIELDS}; where start_time >= ${Math.floor(from)} & start_time < ${Math.floor(to)}; sort start_time asc; ${page}`;
        break;
      default:
        query = `${FIELDS}; sort start_time desc; ${page}`;
    }
  }

  try {
    return publicJson(await igdb("/events", query, { revalidate: 600 }), 300);
  } catch {
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
};
