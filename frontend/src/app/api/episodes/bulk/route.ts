import { NextResponse } from "next/server";

import { createEpisodesBulk } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * POST /web/api/episodes/bulk
 * Create episodes in bulk
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const episodes = await createEpisodesBulk(body);
    return NextResponse.json(episodes, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
