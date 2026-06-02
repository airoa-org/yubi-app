import { NextResponse } from "next/server";

import { validateTaskImport } from "@/lib/api/backend-client";
import { handleApiError } from "@/lib/api/response-helpers";

/**
 * POST /web/api/tasks/import/validate
 * Validate CSV content for task import
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.csv_content || typeof body.csv_content !== "string") {
      return NextResponse.json(
        { message: "csv_content is required and must be a string" },
        { status: 400 }
      );
    }
    const result = await validateTaskImport(body.csv_content);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
