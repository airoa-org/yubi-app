import { NextResponse } from "next/server";

import { fetchEpisodes, createEpisode } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/episodes
 * Fetch all episodes from Backend API
 * Supports optional task_id/task_version_id/robot_id/user_id/status/started_at_from/started_at_to query parameters
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("task_id") ?? undefined;
    const taskVersionId = searchParams.get("task_version_id") ?? undefined;
    const robotId = searchParams.get("robot_id") ?? undefined;
    const userId = searchParams.get("user_id") ?? undefined;
    const statusParams = searchParams.getAll("status");
    const statuses = statusParams
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => !Number.isNaN(n));

    const startedAtFrom = searchParams.get("started_at_from") ?? undefined;
    const startedAtTo = searchParams.get("started_at_to") ?? undefined;

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page =
      pageParam !== null ? Number.parseInt(pageParam, 10) : undefined;
    const limit =
      limitParam !== null ? Number.parseInt(limitParam, 10) : undefined;

    const sortBy = searchParams.get("sort_by") ?? undefined;
    const sortOrder = searchParams.get("sort_order") ?? undefined;

    const episodes = await fetchEpisodes({
      task_id: taskId,
      task_version_id: taskVersionId,
      robot_id: robotId,
      user_id: userId,
      status: statuses.length > 0 ? statuses : undefined,
      started_at_from: startedAtFrom,
      started_at_to: startedAtTo,
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    return NextResponse.json(episodes);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /web/api/episodes
 * Create a new episode
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const episode = await createEpisode(body);
    return NextResponse.json(episode, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
