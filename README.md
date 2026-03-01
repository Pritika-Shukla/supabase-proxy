# Supabase Proxy

A JioBase-like SaaS that provides custom subdomain proxies for Supabase projects.

**Domain:** `proxy.pritika.xyz`  
**Example:** `https://myapp.proxy.pritika.xyz` → `https://{projectId}.supabase.co`

## Features

- **Wildcard subdomains** – Each user gets `{customName}.proxy.pritika.xyz`
- **DB-backed mapping** – `customName` → `projectId` stored in MongoDB
- **Request proxying** – Path and query preserved, hop-by-hop headers stripped
- **Rate limiting** – Per-IP per-subdomain (100 req/min default)
- **CORS** – Proper handling for browser clients
- **Dashboard** – Create proxies, copy URLs, manage mappings

## Setup

1. **Prisma**

```bash
npx prisma generate
```

2. **Environment** – Copy `.env.example` to `.env`:

```env
PROXY_DOMAIN=proxy.pritika.xyz
NEXT_PUBLIC_PROXY_DOMAIN=proxy.pritika.xyz
```

3. **Run**

```bash
npm run dev
```

## Wildcard DNS

For production, add a DNS record:

- Type: `A` or `CNAME`
- Name: `*.proxy` (or `*` depending on DNS provider)
- Value: Your server IP or hostname

This makes `myapp.proxy.pritika.xyz` resolve to your app.

## Local Testing

Use the `x-proxy-subdomain` header to simulate subdomains:

```bash
curl -H "x-proxy-subdomain: myapp" http://localhost:3000/rest/v1/
```

Or use `myapp.localhost` if your setup supports it (set `PROXY_DOMAIN=localhost`).

## Tech Stack

- Next.js 16 (App Router)
- Prisma + MongoDB
- NextAuth (Google)
- Tailwind CSS
