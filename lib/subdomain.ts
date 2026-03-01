/**
 * Parse subdomain from host header for proxy routing.
 * Supports: myapp.proxy.pritika.xyz → myapp
 * Configurable via PROXY_DOMAIN env (e.g. proxy.pritika.xyz)
 * Dev: use x-proxy-subdomain header when testing locally
 */
const PROXY_DOMAIN = process.env.PROXY_DOMAIN ?? "proxy.pritika.xyz";
const SUBDOMAIN_RE = /^[a-z0-9][a-z0-9-]{1,60}[a-z0-9]$/;

export function getProxySubdomain(
  host: string | null,
  headerSubdomain?: string | null
): string | null {
  if (headerSubdomain && SUBDOMAIN_RE.test(headerSubdomain)) {
    return headerSubdomain;
  }
  if (!host) return null;
  const hostWithoutPort = host.split(":")[0].toLowerCase();
  const domain = PROXY_DOMAIN.split(":")[0].toLowerCase();

  if (!hostWithoutPort.endsWith(`.${domain}`) && hostWithoutPort !== domain) {
    return null;
  }

  if (hostWithoutPort === domain) {
    return null;
  }

  const subdomain = hostWithoutPort.slice(0, -domain.length - 1);
  if (subdomain === "www" || subdomain === "") return null;
  if (!SUBDOMAIN_RE.test(subdomain)) return null;
  return subdomain;
}

export function getProxyBaseUrl(): string {
  const domain = PROXY_DOMAIN.split(":")[0];
  if (typeof window !== "undefined") {
    const protocol = window.location?.protocol ?? "https:";
    return `${protocol}//${domain}`;
  }
  return `https://${domain}`;
}

export function getProxyUrl(customName: string): string {
  const domain =
    (typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_PROXY_DOMAIN
      : process.env.PROXY_DOMAIN) ?? PROXY_DOMAIN;
  return `https://${customName}.${domain.split(":")[0]}`;
}
