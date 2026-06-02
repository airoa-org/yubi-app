import { NextResponse } from "next/server";

import { fetchRobot, updateRobot, deleteRobot } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type Params = Promise<{ robotId: string }>;

/**
 * GET /web/api/robots/:robotId
 * Fetch a specific robot
 */
export async function GET(_request: Request, { params }: { params: Params }) {
  try {
    const { robotId } = await params;
    const robot = await fetchRobot(robotId);
    return NextResponse.json(robot);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /web/api/robots/:robotId
 * Update a robot
 */
export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { robotId } = await params;
    const body = await request.json();
    const robot = await updateRobot(robotId, body);
    return NextResponse.json(robot);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /web/api/robots/:robotId
 * Delete a robot
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Params }
) {
  try {
    const { robotId } = await params;
    await deleteRobot(robotId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
