import { NextResponse } from "next/server";

import { fetchEpisode, updateEpisode } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type Params = Promise<{ episodeId: string }>;

/**
 * GET /web/api/episodes/:episodeId
 * Fetch a specific episode
 */
export async function GET(_request: Request, { params }: { params: Params }) {
  try {
    const { episodeId } = await params;
    const episode = await fetchEpisode(episodeId);
    return NextResponse.json(episode);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /web/api/episodes/:episodeId
 * Update an episode
 */
export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { episodeId } = await params;
    const body = await request.json();
    const episode = await updateEpisode(episodeId, body);
    return NextResponse.json(episode);
  } catch (error) {
    return handleApiError(error);
  }
}
