import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { getProxySubdomain } from "@/lib/subdomain";
import { NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req: NextRequest) => {
  const host = req.headers.get("host");
  const headerSubdomain = req.headers.get("x-proxy-subdomain");
  const subdomain = getProxySubdomain(host, headerSubdomain);

  if (subdomain) {
    const path = req.nextUrl.pathname + req.nextUrl.search;
    const rewriteUrl = new URL(`/api/proxy${path === "/" ? "" : path}`, req.url);
    rewriteUrl.search = req.nextUrl.search;

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-proxy-subdomain", subdomain);

    return NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
  }

  const session = (req as NextRequest & { auth?: { user?: unknown } }).auth;
  if (!session) {
    return Response.redirect(new URL("/sign-in", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|sign-in|_next/static|_next/image|favicon.ico).*)"],
};
