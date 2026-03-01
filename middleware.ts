import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;

export default auth((req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  const segments = pathname.slice(1).split("/").filter(Boolean);
  const firstSegment = segments[0];

  const reserved = new Set(["sign-in"]);
  if (reserved.has(firstSegment ?? "")) {
    return NextResponse.next();
  }

  // Proxy routes: /[slug]/[...path] - bypass auth (slug-like first segment)
  if (firstSegment && SLUG_REGEX.test(firstSegment)) {
    return NextResponse.next();
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
