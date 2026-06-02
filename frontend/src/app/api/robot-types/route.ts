import { type NextRequest, NextResponse } from "next/server";

import { fetchRobotTypes } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/robot-types
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const types = await fetchRobotTypes({
      site_id: searchParams.get("site_id") || undefined,
      location_id: searchParams.get("location_id") || undefined,
      status: searchParams.has("status")
        ? Number(searchParams.get("status"))
        : undefined,
    });
    return NextResponse.json(types);
  } catch (error) {
    return handleApiError(error);
  }
}
