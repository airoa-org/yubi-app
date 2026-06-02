import { fetchBackendRaw } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * GET /web/api/episodes/export
 * Export episodes as CSV — proxies to the Go backend with auth headers forwarded via fetchBackendRaw.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const response = await fetchBackendRaw(
      `/api/episodes/export?${searchParams.toString()}`
    );
    const buffer = await response.arrayBuffer();
    if (!response.ok) {
      return new Response(buffer, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="episodes_export.csv"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
