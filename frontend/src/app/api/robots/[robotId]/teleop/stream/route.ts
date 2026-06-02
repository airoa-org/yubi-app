import { proxySSEStream } from "@/app/api/_shared/sse-proxy";

type Params = Promise<{ robotId: string }>;

/**
 * GET /web/api/robots/:robotId/teleop/stream
 *
 * Combined teleop SSE stream (named events: robot_status, episode, task).
 * proxySSEStream forwards the named-event byte stream unchanged.
 */
export async function GET(request: Request, { params }: { params: Params }) {
  const { robotId } = await params;
  return proxySSEStream(request, `/api/robots/${robotId}/teleop/stream`);
}
