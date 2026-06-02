import { NextRequest, NextResponse } from "next/server";

import { createUser, fetchUsers } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/users
 * Fetch all users from Backend API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const result = await fetchUsers({
      page: searchParams.get("page")
        ? Number(searchParams.get("page"))
        : undefined,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
      location_id: searchParams.get("location_id") ?? undefined,
      site_id: searchParams.get("site_id") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      sort_by: searchParams.get("sort_by") ?? undefined,
      sort_order: searchParams.get("sort_order") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /web/api/users
 * Create a new user via Backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createUser(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
