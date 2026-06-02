import { NextRequest, NextResponse } from "next/server";

import { fetchMe, updateMe } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/me
 * Fetch the currently authenticated user from Backend API
 */
export async function GET() {
  try {
    const user = await fetchMe();
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /web/api/me
 * Update the currently authenticated user's own profile (display_name only)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await updateMe(body);
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
