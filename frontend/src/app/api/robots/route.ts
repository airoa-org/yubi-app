import { NextResponse } from "next/server";

import { fetchRobots, createRobot } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/robots
 * Fetch all robots from Backend API with optional filters
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("site_id") ?? undefined;
    const locationId = searchParams.get("location_id") ?? undefined;
    const statusParam = searchParams.get("status");
    const parsedStatus = statusParam !== null ? Number(statusParam) : NaN;
    const status = !isNaN(parsedStatus) ? parsedStatus : undefined;
    const robot_type = searchParams.get("robot_type") ?? undefined;
    const pageParam = searchParams.get("page");
    const page = pageParam !== null ? Number(pageParam) : undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam !== null ? Number(limitParam) : undefined;
    const sortBy = searchParams.get("sort_by") ?? undefined;
    const sortOrder = searchParams.get("sort_order") ?? undefined;

    const search = searchParams.get("search") ?? undefined;

    const result = await fetchRobots({
      site_id: siteId,
      location_id: locationId,
      status,
      robot_type,
      page,
      limit,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /web/api/robots
 * Create a new robot
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const robot = await createRobot(body);
    return NextResponse.json(robot, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
