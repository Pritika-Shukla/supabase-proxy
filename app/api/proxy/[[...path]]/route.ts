import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
  "x-proxy-subdomain",
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

type Ctx = { params: Promise<{ path?: string[] }> };

async function proxy(req: NextRequest, ctx: Ctx) {
  const subdomain = req.headers.get("x-proxy-subdomain");
  if (!subdomain) {
    return NextResponse.json(
      { error: "Missing proxy subdomain" },
      { status: 400 }
    );
  }

  const mapping = await prisma.proxy.findUnique({
    where: { customName: subdomain.toLowerCase() },
    select: { projectId: true },
  });

  if (!mapping) {
    return NextResponse.json(
      { error: "Proxy not found", code: "PROXY_NOT_FOUND" },
      { status: 404 }
    );
  }

  const { projectId } = mapping;
  if (!PROJECT_ID_RE.test(projectId)) {
    return NextResponse.json(
      { error: "Invalid project configuration" },
      { status: 500 }
    );
  }

  const { path = [] } = await ctx.params;
  const pathStr = Array.isArray(path) ? path.join("/") : path;
  const search = req.nextUrl.search;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rl = rateLimit(`${ip}:${subdomain}`);

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

  const upstream = `https://${projectId}.supabase.co/${pathStr}${search}`;

  const fwdHeaders = new Headers();
  for (const [k, v] of req.headers) {
    if (!STRIP_REQ_HEADERS.has(k.toLowerCase())) fwdHeaders.set(k, v);
  }
  fwdHeaders.set("Host", `${projectId}.supabase.co`);

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
    upstreamRes = await fetch(upstream, init);
  } catch (err) {
    return NextResponse.json(
      { error: "Upstream unreachable", detail: String(err) },
      { status: 502 }
    );
  }

  const resHeaders = new Headers();
  for (const [k, v] of upstreamRes.headers) {
    if (!STRIP_RES_HEADERS.has(k.toLowerCase())) resHeaders.set(k, v);
  }

  resHeaders.set("X-RateLimit-Limit", "100");
  resHeaders.set("X-RateLimit-Remaining", String(rl.remaining));
  resHeaders.set("Access-Control-Allow-Origin", "*");
  resHeaders.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  resHeaders.set("Access-Control-Allow-Headers", "*");

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
