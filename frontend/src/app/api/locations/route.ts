import { NextResponse } from "next/server";

import { fetchLocations, createLocation } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/locations
 * Fetch all locations from Backend API
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const page = pageParam !== null ? Number(pageParam) : undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam !== null ? Number(limitParam) : undefined;

    const search = searchParams.get("search") ?? undefined;
    const siteId = searchParams.get("site_id") ?? undefined;
    const sort_by = searchParams.get("sort_by") ?? undefined;
    const sort_order = searchParams.get("sort_order") ?? undefined;

    const result = await fetchLocations({
      page,
      limit,
      search,
      site_id: siteId,
      sort_by,
      sort_order,
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /web/api/locations
 * Create a new location
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const location = await createLocation(body);
    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
