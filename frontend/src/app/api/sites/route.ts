import { NextResponse } from "next/server";

import { fetchSites } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/sites
 * Fetch sites from Backend API
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get("page");
    const page = pageParam !== null ? Number(pageParam) : undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam !== null ? Number(limitParam) : undefined;

    const search = searchParams.get("search") ?? undefined;
    const organizationId = searchParams.get("organization_id") ?? undefined;

    const result = await fetchSites({
      page,
      limit,
      search,
      organization_id: organizationId,
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
