import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const SLUG_REGEX = /^[a-z0-9-]{3,50}$/;

function isProxyPath(pathname: string): boolean {
  const segments = pathname.slice(1).split("/").filter(Boolean);
  const first = segments[0];
  return !!first && SLUG_REGEX.test(first);
}

const authMiddleware = auth((req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  const segments = pathname.slice(1).split("/").filter(Boolean);
  const firstSegment = segments[0];

  const reserved = new Set(["sign-in"]);
  if (reserved.has(firstSegment ?? "")) {
    return NextResponse.next();
  }

  const session = (req as NextRequest & { auth?: { user?: unknown } }).auth;
  if (!session) {
    return Response.redirect(new URL("/sign-in", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (isProxyPath(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return authMiddleware(req, event as unknown as Parameters<typeof authMiddleware>[1]);
}

export const config = {
  matcher: ["/((?!api/auth|sign-in|_next/static|_next/image|favicon.ico).*)"],
};
