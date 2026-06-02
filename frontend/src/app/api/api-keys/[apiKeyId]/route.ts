import { NextRequest, NextResponse } from "next/server";

import { fetchApiKey, revokeApiKey } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

type RouteContext = {
  params: Promise<{ apiKeyId: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { apiKeyId } = await context.params;
    const apiKey = await fetchApiKey(apiKeyId);
    return NextResponse.json(apiKey);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { apiKeyId } = await context.params;
    await revokeApiKey(apiKeyId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
