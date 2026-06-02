import { NextResponse } from "next/server";

import { updateUserRole } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

/**
 * PUT /web/api/users/:userId/role
 * Update a user's role
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    const user = await updateUserRole(userId, body);
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
