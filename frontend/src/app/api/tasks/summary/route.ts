import { NextResponse } from "next/server";

import { fetchTaskSummary } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/tasks/summary
 * Fetch aggregated task summary
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const robotType = searchParams.getAll("robot_type");
    const categoryTypeId = searchParams.get("category_type_id") ?? undefined;
    const tagId = searchParams.getAll("tag_id");

    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;

    const data = await fetchTaskSummary({
      robot_type: robotType.length > 0 ? robotType : undefined,
      category_type_id: categoryTypeId,
      tag_id: tagId.length > 0 ? tagId : undefined,
      from,
      to,
    });
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
