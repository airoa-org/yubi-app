import { proxySSEStream } from "@/app/api/_shared/sse-proxy";

type Params = Promise<{ episodeId: string }>;

/**
 * GET /web/api/episodes/:episodeId/stream
 * Proxies SSE stream from backend with authentication
 */
export async function GET(request: Request, { params }: { params: Params }) {
  const { episodeId } = await params;
  return proxySSEStream(request, `/api/episodes/${episodeId}/stream`);
}
