import { proxySSEStream } from "@/app/api/_shared/sse-proxy";

type Params = Promise<{ robotId: string }>;

/**
 * GET /web/api/robots/:robotId/episodes/stream
 * Proxies SSE stream from backend with authentication
 */
export async function GET(request: Request, { params }: { params: Params }) {
  const { robotId } = await params;
  return proxySSEStream(request, `/api/robots/${robotId}/episodes/stream`);
}
