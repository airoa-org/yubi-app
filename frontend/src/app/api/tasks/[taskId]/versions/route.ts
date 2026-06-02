import { NextResponse } from "next/server";

import { createTaskVersion, fetchTaskVersions } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type Params = Promise<{ taskId: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  try {
    const { taskId } = await params;
    const versions = await fetchTaskVersions(taskId);
    return NextResponse.json(versions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const { taskId } = await params;
    const data = await request.json();
    const result = await createTaskVersion(taskId, data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
