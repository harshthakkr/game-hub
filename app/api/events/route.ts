import axios from "axios";
import { getIgdbHeaders } from "@/lib/igdb";
import { NextRequest, NextResponse } from "next/server";

const FIELDS = "fields name,slug,event_logo.url,description,start_time,end_time";

/// Events, newest first. With `upcoming=1`, only events that are live or still
/// to come, soonest first (Discover's "Live & upcoming" shelf).
export const GET = async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const offset = Math.max(0, Number(params.get("offset")) || 0);
  const now = Math.floor(Date.now() / 1000);
  const query =
    params.get("upcoming") === "1"
      ? `${FIELDS}; where end_time >= ${now} | start_time >= ${now}; sort start_time asc; limit 8;`
      : `${FIELDS}; sort start_time desc; limit 20; offset ${offset};`;

  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/events`, query, {
      headers: await getIgdbHeaders(),
    });
    return NextResponse.json(res.data);
  } catch {
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
};
