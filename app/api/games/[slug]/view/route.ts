import { NextRequest, NextResponse } from "next/server";
import { markViewed } from "@/lib/prices";
import { safeSlug } from "@/lib/http";

/// Beacon from the game page: someone opened it, so its prices move to the
/// 3-hourly tier. Kept out of the page render so the page itself can be cached.
export const POST = async (
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const slug = safeSlug((await params).slug);
  await markViewed(slug).catch(() => {});
  return new NextResponse(null, { status: 204 });
};
