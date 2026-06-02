import { NextResponse } from "next/server";

import {
  fetchSubTask,
  updateSubTask,
  deleteSubTask,
} from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type RouteContext = {
  params: Promise<{ subtaskId: string }>;
};

/**
 * GET /web/api/subtasks/:subtaskId
 * Fetch a specific subtask
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { subtaskId } = await context.params;
    const subtask = await fetchSubTask(subtaskId);
    return NextResponse.json(subtask);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /web/api/subtasks/:subtaskId
 * Update a subtask
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { subtaskId } = await context.params;
    const body = await request.json();
    const subtask = await updateSubTask(subtaskId, body);
    return NextResponse.json(subtask);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /web/api/subtasks/:subtaskId
 * Delete a subtask
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { subtaskId } = await context.params;
    await deleteSubTask(subtaskId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
