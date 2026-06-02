import { NextRequest, NextResponse } from "next/server";

import { updateUserLocations } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

/**
 * PUT /web/api/users/:userId/locations
 * Update user location assignments (admin only)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    const user = await updateUserLocations(userId, body.location_ids ?? []);
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
