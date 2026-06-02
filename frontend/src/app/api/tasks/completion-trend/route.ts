import { NextResponse } from "next/server";

import { fetchTaskCompletionTrend } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/tasks/completion-trend
 * Fetch task completion trend data
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupBy = searchParams.get("group_by") ?? "category";
    const robotType = searchParams.getAll("robot_type");
    const categoryTypeId = searchParams.get("category_type_id") ?? undefined;
    const tagId = searchParams.getAll("tag_id");

    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;
    const interval = searchParams.get("interval") ?? undefined;

    const data = await fetchTaskCompletionTrend({
      group_by: groupBy,
      robot_type: robotType.length > 0 ? robotType : undefined,
      category_type_id: categoryTypeId,
      tag_id: tagId.length > 0 ? tagId : undefined,
      from,
      to,
      interval,
    });
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
