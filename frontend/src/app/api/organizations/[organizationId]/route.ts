import { NextResponse } from "next/server";

import { fetchOrganization } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type RouteContext = {
  params: Promise<{ organizationId: string }>;
};

/**
 * GET /web/api/organizations/:organizationId
 * Fetch a single organization by ID from Backend API
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { organizationId } = await context.params;
    const organization = await fetchOrganization(organizationId);
    return NextResponse.json(organization);
  } catch (error) {
    return handleApiError(error);
  }
}
