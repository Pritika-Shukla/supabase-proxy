import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

const PROXY_RE = /^\/[a-z][a-z0-9]{2,62}\/.+/;

export default auth((req) => {
  // Proxy routes bypass auth — rate limiting lives in the route handler
  if (PROXY_RE.test(req.nextUrl.pathname)) return;

  if (!req.auth) {
    return Response.redirect(new URL("/sign-in", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!api/auth|sign-in|_next/static|_next/image|favicon.ico).*)"],
};
