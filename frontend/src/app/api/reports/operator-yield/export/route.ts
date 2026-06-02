import { NextResponse } from "next/server";

import { BackendApiError, fetchBackendRaw } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

// Proxies to the Go backend; auth headers are forwarded by fetchBackendRaw.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const response = await fetchBackendRaw(
      `/api/reports/operator-yield/export?${searchParams.toString()}`
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
        "Content-Disposition":
          response.headers.get("Content-Disposition") ??
          'attachment; filename="operator_yield_export.csv"',
      },
    });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }
    return handleApiError(error);
  }
}
