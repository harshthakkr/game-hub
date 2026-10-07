import { NextRequest, NextResponse } from "next/server";
import { refreshDueListings } from "@/lib/prices";

// Leave headroom under the 60s function limit for the final prune + response.
export const maxDuration = 60;
const BUDGET_MS = 45_000;

/// Hit hourly by the scheduler (see .github/workflows/price-tracker.yml).
/// Guarded by CRON_SECRET so the public can't trigger scrapes.
export const GET = async (request: NextRequest) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await refreshDueListings(BUDGET_MS);
  return NextResponse.json(result);
};
