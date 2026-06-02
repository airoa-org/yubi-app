import { NextResponse } from "next/server";

import { listEpisodeGrades } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type Params = Promise<{ episodeId: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { episodeId } = await params;
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page =
      pageParam !== null ? Number.parseInt(pageParam, 10) : undefined;
    const limit =
      limitParam !== null ? Number.parseInt(limitParam, 10) : undefined;

    const result = await listEpisodeGrades(episodeId, { page, limit });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
