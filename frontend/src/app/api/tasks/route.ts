import { NextResponse } from "next/server";

import { fetchTasks, createTask } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/tasks
 * Fetch all tasks from Backend API
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hasApprovedVersion =
      searchParams.get("has_approved_version") === "true" ? true : undefined;
    const pageParam = searchParams.get("page");
    const page = pageParam !== null ? Number(pageParam) : undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam !== null ? Number(limitParam) : undefined;
    const sortBy = searchParams.get("sort_by") ?? undefined;
    const sortOrder = searchParams.get("sort_order") ?? undefined;
    const status = searchParams
      .getAll("status")
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    const priority = searchParams
      .getAll("priority")
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    const difficulty = searchParams
      .getAll("difficulty")
      .map(Number)
      .filter((n) => !Number.isNaN(n));
    const robotType = searchParams.get("robot_type") ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    const result = await fetchTasks({
      has_approved_version: hasApprovedVersion,
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder,
      status: status.length > 0 ? status : undefined,
      priority: priority.length > 0 ? priority : undefined,
      difficulty: difficulty.length > 0 ? difficulty : undefined,
      robot_type: robotType,
      search,
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /web/api/tasks
 * Create a new task
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const task = await createTask(body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
