import { NextRequest, NextResponse } from "next/server";

import { createApiKey, fetchApiKeys } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/api-keys
 * List API keys in the caller's organization.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const result = await fetchApiKeys({
      page: searchParams.get("page")
        ? Number(searchParams.get("page"))
        : undefined,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
      robot_id: searchParams.get("robot_id") ?? undefined,
      user_id: searchParams.get("user_id") ?? undefined,
      include_revoked:
        searchParams.get("include_revoked") === "true" ? true : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /web/api/api-keys
 * Issue a new API key. The raw key is returned exactly once.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createApiKey(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
