import { proxySSEStream } from "@/app/api/_shared/sse-proxy";

export async function GET(request: Request) {
  return proxySSEStream(request, "/api/episodes/stream");
}
