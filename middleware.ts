import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/sign-in") {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!api/auth|sign-in|_next/static|_next/image|favicon.ico).*)"],
};
