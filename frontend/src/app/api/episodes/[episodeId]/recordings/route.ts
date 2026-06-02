import { NextResponse } from "next/server";

import { fetchEpisodeRecordings } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type Params = Promise<{ episodeId: string }>;

/**
 * GET /web/api/episodes/:episodeId/recordings
 * Fetch presigned URLs for episode recording videos
 */
export async function GET(_request: Request, { params }: { params: Params }) {
  try {
    const { episodeId } = await params;
    const recordings = await fetchEpisodeRecordings(episodeId);
    return NextResponse.json(recordings);
  } catch (error) {
    return handleApiError(error);
  }
}
