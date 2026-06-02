import { NextResponse } from "next/server";

import { approveTaskVersion } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type Params = Promise<{ taskId: string; versionId: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  try {
    const { taskId, versionId } = await params;
    const result = await approveTaskVersion(taskId, versionId);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
