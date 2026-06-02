import { NextResponse } from "next/server";

import { fetchEpisodeStats } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type Params = Promise<{ episodeId: string }>;

/**
 * GET /web/api/episodes/:episodeId/stats
 * Fetch statistics for an episode
 */
export async function GET(_request: Request, { params }: { params: Params }) {
  try {
    const { episodeId } = await params;
    const stats = await fetchEpisodeStats(episodeId);
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
