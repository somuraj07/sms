import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Skip middleware for API routes that don't need subdomain resolution
  if (url.pathname.startsWith("/api/auth") || url.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Extract subdomain from hostname
  // Format: subdomain.company.com or subdomain.localhost:3000
  let subdomain = "";
  
  // Handle localhost:3000 case - e.g., college1.localhost:3000
  if (hostname.includes("localhost")) {
    const parts = hostname.split(".");
    // If first part is not "localhost", it's the subdomain
    if (parts.length > 1 && parts[0] !== "localhost") {
      subdomain = parts[0];
    }
  } else {
    // For production domains: subdomain.domain.com
    const parts = hostname.split(".");
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  // If it's the main domain (no subdomain or 'www'), skip
  if (subdomain === "www" || !subdomain) {
    return NextResponse.next();
  }

  // Add subdomain to headers for API routes to resolve
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-subdomain", subdomain);

  // Add subdomain to URL search params for client-side access
  url.searchParams.set("subdomain", subdomain);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
