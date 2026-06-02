import { NextResponse } from "next/server";

import {
  fetchLocation,
  updateLocation,
  deleteLocation,
} from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type RouteContext = {
  params: Promise<{ locationId: string }>;
};

/**
 * GET /web/api/locations/:locationId
 * Fetch a single location by ID from Backend API
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { locationId } = await context.params;
    const location = await fetchLocation(locationId);
    return NextResponse.json(location);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /web/api/locations/:locationId
 * Update a location
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { locationId } = await context.params;
    const body = await request.json();
    const location = await updateLocation(locationId, body);
    return NextResponse.json(location);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /web/api/locations/:locationId
 * Delete a location
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { locationId } = await context.params;
    await deleteLocation(locationId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
