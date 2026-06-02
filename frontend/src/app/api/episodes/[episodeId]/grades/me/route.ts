import { NextResponse } from "next/server";

import {
  fetchMyEpisodeGrade,
  updateMyEpisodeGrade,
} from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type Params = Promise<{ episodeId: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  try {
    const { episodeId } = await params;
    const grade = await fetchMyEpisodeGrade(episodeId);
    if (grade === null) {
      return NextResponse.json({ error: "not graded yet" }, { status: 404 });
    }
    return NextResponse.json(grade);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { episodeId } = await params;
    const body = await request.json();
    const grade = await updateMyEpisodeGrade(episodeId, body);
    return NextResponse.json(grade);
  } catch (error) {
    return handleApiError(error);
  }
}
