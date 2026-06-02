import { NextRequest, NextResponse } from "next/server";

import { fetchTaskTags, createTaskTag } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/task-tags
 * GET /web/api/task-tags?category_type_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const categoryTypeId =
      request.nextUrl.searchParams.get("category_type_id") ?? undefined;
    const tags = await fetchTaskTags(categoryTypeId);
    return NextResponse.json(tags);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /web/api/task-tags
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tag = await createTaskTag(body);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
