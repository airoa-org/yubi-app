import { NextResponse } from "next/server";

import { fetchFleetSummary } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/fleet/summary
 * Fetch real-time fleet summary (no date range filtering)
 */
export async function GET() {
  try {
    const data = await fetchFleetSummary();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
