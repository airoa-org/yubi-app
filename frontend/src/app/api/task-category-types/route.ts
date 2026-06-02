import { NextResponse } from "next/server";

import { fetchTaskCategoryTypes } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/task-category-types
 */
export async function GET() {
  try {
    const types = await fetchTaskCategoryTypes();
    return NextResponse.json(types);
  } catch (error) {
    return handleApiError(error);
  }
}
