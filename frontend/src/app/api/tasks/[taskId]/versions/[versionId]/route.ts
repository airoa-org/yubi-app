import { NextResponse } from "next/server";

import { updateTaskVersion } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type Params = Promise<{ taskId: string; versionId: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const { taskId, versionId } = await params;
    const data = await request.json();
    const result = await updateTaskVersion(taskId, versionId, data);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
