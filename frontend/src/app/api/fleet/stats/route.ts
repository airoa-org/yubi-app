import { NextResponse } from "next/server";

import { fetchFleetStats } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/fleet/stats?from=...&to=...
 * Fetch fleet statistics for a date range
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";

    const data = await fetchFleetStats(from, to);
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
