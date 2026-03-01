import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { SLUG_REGEX } from "@/lib/validators";

export const dynamic = "force-dynamic";

const STRIP_REQ_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
]);

const STRIP_RES_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "content-encoding",
  "content-length",
]);

type Ctx = { params: Promise<{ slug: string; path?: string[] }> };

function getProxyBase(request: NextRequest): string {
  const host = request.headers.get("host") ?? "";
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host.split(":")[0]}`;
}

function rewriteLocation(
  location: string,
  upstreamOrigin: string,
  proxyBase: string
): string {
  if (!location?.trim()) return location;
  try {
    const loc = new URL(location, upstreamOrigin);
    if (loc.origin === upstreamOrigin) {
      return location.replace(loc.origin, proxyBase);
    }
  } catch {
    /* ignore */
  }
  return location;
}

async function proxy(req: NextRequest, ctx: Ctx) {
  const { slug, path = [] } = await ctx.params;

  if (!SLUG_REGEX.test(slug)) {
    return NextResponse.json(
      { error: "Invalid slug format", code: "INVALID_SLUG" },
      { status: 400 }
    );
  }

  const app = await prisma.app.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { supabaseUrl: true },
  });

  if (!app) {
    return NextResponse.json(
      { error: "Proxy not found", code: "PROXY_NOT_FOUND" },
      { status: 404 }
    );
  }

  const upstreamBase = app.supabaseUrl.replace(/\/$/, "");
  const pathStr = Array.isArray(path) ? path.join("/") : path;
  const search = req.nextUrl.search;
  const upstreamUrl = `${upstreamBase}/${pathStr}${search}`;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rl = rateLimit(`${ip}:${slug}`);

  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
          "X-RateLimit-Limit": "100",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const fwdHeaders = new Headers();
  for (const [k, v] of req.headers) {
    if (!STRIP_REQ_HEADERS.has(k.toLowerCase())) fwdHeaders.set(k, v);
  }
  fwdHeaders.set("Host", new URL(upstreamBase).host);

  const init: RequestInit & { duplex?: string } = {
    method: req.method,
    headers: fwdHeaders,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(req.method)) {
    init.body = req.body;
    init.duplex = "half";
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstreamUrl, init);
  } catch (err) {
    return NextResponse.json(
      { error: "Upstream unreachable", detail: String(err), code: "UPSTREAM_ERROR" },
      { status: 502 }
    );
  }

  const resHeaders = new Headers();
  for (const [k, v] of upstreamRes.headers) {
    if (!STRIP_RES_HEADERS.has(k.toLowerCase())) resHeaders.set(k, v);
  }

  const loc = resHeaders.get("Location");
  if (loc) {
    const proxyBase = getProxyBase(req);
    resHeaders.set("Location", rewriteLocation(loc, upstreamBase, proxyBase));
  }

  resHeaders.set("X-RateLimit-Limit", "100");
  resHeaders.set("X-RateLimit-Remaining", String(rl.remaining));
  resHeaders.set("Access-Control-Allow-Origin", "*");
  resHeaders.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  resHeaders.set("Access-Control-Allow-Headers", "*");
  resHeaders.set("Access-Control-Expose-Headers", "*");

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: resHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    },
  });
}
