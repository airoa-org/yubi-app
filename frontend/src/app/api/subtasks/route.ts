import { NextResponse } from "next/server";

import { fetchSubTasks, createSubTask } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/subtasks
 * Fetch all subtasks from Backend API
 * Supports optional task_id and task_version_id query parameters
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("task_id") ?? undefined;
    const taskVersionId = searchParams.get("task_version_id") ?? undefined;
    const subtasks = await fetchSubTasks(taskId, taskVersionId);
    return NextResponse.json(subtasks);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /web/api/subtasks
 * Create a new subtask
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subtask = await createSubTask(body);
    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
