import { NextResponse } from "next/server";

import { BackendApiError } from "./backend-client";

// Handle API errors and return appropriate NextResponse
// Use this in Route Handlers to ensure consistent error responses

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof BackendApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
