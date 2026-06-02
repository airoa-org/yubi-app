import { NextRequest, NextResponse } from "next/server";

import { fetchUser, updateUser } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

/**
 * GET /web/api/users/:userId
 * Fetch a single user by ID from Backend API
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const user = await fetchUser(userId);
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /web/api/users/:userId
 * Update a user (display_name, email, location_ids)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    const user = await updateUser(userId, body);
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
