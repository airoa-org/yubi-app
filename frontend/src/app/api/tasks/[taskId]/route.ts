import { NextResponse } from "next/server";

import { fetchTask, updateTask } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type Params = Promise<{ taskId: string }>;

/**
 * GET /web/api/tasks/:taskId
 * Fetch a specific task
 */
export async function GET(_request: Request, { params }: { params: Params }) {
  try {
    const { taskId } = await params;
    const task = await fetchTask(taskId);
    return NextResponse.json(task);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /web/api/tasks/:taskId
 * Update a task
 */
export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { taskId } = await params;
    const body = await request.json();
    const task = await updateTask(taskId, body);
    return NextResponse.json(task);
  } catch (error) {
    return handleApiError(error);
  }
}
