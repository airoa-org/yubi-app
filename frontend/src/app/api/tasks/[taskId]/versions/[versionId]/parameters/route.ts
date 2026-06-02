import { NextResponse } from "next/server";

import { updateTaskVersionParameters } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type Params = Promise<{ taskId: string; versionId: string }>;

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { taskId, versionId } = await params;
    const body = await request.json();
    const result = await updateTaskVersionParameters(taskId, versionId, body);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
