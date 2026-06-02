import { NextResponse } from "next/server";

import { proxySSEStream } from "@/app/api/_shared/sse-proxy";

/**
 * GET /web/api/robots/status/stream?robotIds=1,2,3
 * Proxies SSE stream of robots from backend with authentication
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const robotIds = searchParams.get("robotIds");

  if (!robotIds) {
    return NextResponse.json(
      { error: "robotIds is required" },
      { status: 400 }
    );
  }

  return proxySSEStream(
    request,
    `/api/robots/status/stream?robotIds=${encodeURIComponent(robotIds)}`
  );
}
