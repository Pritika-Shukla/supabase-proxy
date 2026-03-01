import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const PROJECT_ID_RE = /^[a-z][a-z0-9]{2,62}$/;

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

type Ctx = { params: Promise<{ project: string; path: string[] }> };

async function proxy(req: NextRequest, ctx: Ctx) {
  const { project, path } = await ctx.params;

  if (!PROJECT_ID_RE.test(project)) {
    return NextResponse.json(
      { error: "Invalid project ID — must be lowercase alphanumeric (3-63 chars)" },
      { status: 400 }
    );
  }

  // Rate-limit by client IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const rl = rateLimit(ip);

  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
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

  // Build upstream URL preserving path + query string
  const upstream = `https://${project}.supabase.co/${path.join("/")}${req.nextUrl.search}`;

  // Forward request headers, stripping hop-by-hop / proxy headers
  const fwdHeaders = new Headers();
  for (const [k, v] of req.headers) {
    if (!STRIP_REQ_HEADERS.has(k.toLowerCase())) fwdHeaders.set(k, v);
  }

  const init: RequestInit & { duplex?: string } = {
    method: req.method,
    headers: fwdHeaders,
    redirect: "manual",
  };

  // Stream the request body for methods that carry one
  if (!["GET", "HEAD"].includes(req.method)) {
    init.body = req.body;
    init.duplex = "half";
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstream, init);
  } catch (err) {
    return NextResponse.json(
      { error: "Upstream unreachable", detail: String(err) },
      { status: 502 }
    );
  }

  // Forward response headers, stripping hop-by-hop + encoding
  const resHeaders = new Headers();
  for (const [k, v] of upstreamRes.headers) {
    if (!STRIP_RES_HEADERS.has(k.toLowerCase())) resHeaders.set(k, v);
  }

  resHeaders.set("X-RateLimit-Limit", "100");
  resHeaders.set("X-RateLimit-Remaining", String(rl.remaining));
  resHeaders.set("Access-Control-Allow-Origin", "*");
  resHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  resHeaders.set("Access-Control-Allow-Headers", "*");

  // Stream the upstream body back to the client
  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
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
