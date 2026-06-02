import { NextResponse } from "next/server";

import { fetchTaskAvailableTags } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/tasks/available-tags
 * Fetch tags available for tasks matching filters
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const robotType = searchParams.getAll("robot_type");
    const categoryTypeId = searchParams.get("category_type_id") ?? undefined;

    const data = await fetchTaskAvailableTags({
      robot_type: robotType.length > 0 ? robotType : undefined,
      category_type_id: categoryTypeId,
    });
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
