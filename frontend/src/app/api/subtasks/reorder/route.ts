import { NextResponse } from "next/server";

import { reorderSubTasks } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * POST /web/api/subtasks/reorder
 * Reorder subtasks by providing an ordered list of subtask IDs
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subtasks = await reorderSubTasks(body);
    return NextResponse.json(subtasks);
  } catch (error) {
    return handleApiError(error);
  }
}
