import { NextRequest, NextResponse, userAgent } from "next/server";
import { markViewed } from "@/lib/prices";
import { safeSlug } from "@/lib/http";

/// Beacon from the game page: someone opened it, so its prices move to the
/// 6-hourly tier. Kept out of the page render so the page itself can be cached.
/// Crawlers that run JavaScript send it too; they're ignored, or every page
/// a bot walks would wake the database and join the 6-hourly sweep.
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  if (userAgent(request).isBot) return new NextResponse(null, { status: 204 });
  const slug = safeSlug((await params).slug);
  await markViewed(slug).catch(() => {});
  return new NextResponse(null, { status: 204 });
};
