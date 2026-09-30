import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The site is reachable at multiple hosts (Railway's own *.up.railway.app
// domain, www.financierpost.com) that all serve identical content to the
// canonical apex domain. Google flagged this as "Duplicate without
// user-selected canonical" because nothing told it which host is authoritative.
// A 308 redirect to the canonical host fixes this at the network layer,
// independent of any <link rel="canonical"> tag.
const CANONICAL_HOST = "financierpost.com";
const DUPLICATE_HOSTS = new Set([
  "www.financierpost.com",
  "web-production-31444.up.railway.app",
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  if (host && DUPLICATE_HOSTS.has(host)) {
    const url = new URL(request.url);
    url.host = CANONICAL_HOST;
    url.port = "";
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon).*)"],
};
