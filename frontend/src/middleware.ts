import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  const duration = Date.now() - start;

  console.log({
    method: request.method,
    url: request.url,
    pathname: request.nextUrl.pathname,
    status: response.status,
    duration: `${duration}ms`,
    userAgent: request.headers.get("user-agent"),
    ip:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip"),
    timestamp: new Date().toISOString(),
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
