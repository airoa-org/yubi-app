import { NextResponse } from "next/server";

import { fetchFleetCollectionTrend } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/fleet/collection-trend?granularity=...&from=...&to=...
 * Fetch collection trend data for a date range
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const granularity = searchParams.get("granularity") ?? "monthly";
    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";

    const data = await fetchFleetCollectionTrend(granularity, from, to);
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
