"use client";

import { useEffect, useState } from "react";
import { getProxyUrl } from "@/lib/subdomain";

type Proxy = { customName: string; projectId: string; createdAt: Date };

export function ProxyList({ initial }: { initial: Proxy[] }) {
  const [proxies, setProxies] = useState(initial);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setProxies(initial);
  }, [initial]);

  async function copyUrl(customName: string) {
    const url = getProxyUrl(customName);
    await navigator.clipboard.writeText(url);
    setCopied(customName);
    setTimeout(() => setCopied(null), 2000);
  }

  if (proxies.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-200">Your proxies</h2>
      <ul className="divide-y divide-zinc-700 rounded-lg border border-zinc-700/50">
        {proxies.map((p) => {
          const url = getProxyUrl(p.customName);
          return (
            <li
              key={p.customName}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-zinc-100">{p.customName}</p>
                <p className="truncate text-sm text-zinc-500">
                  {p.projectId}.supabase.co
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="truncate rounded bg-zinc-800/80 px-3 py-1.5 text-sm text-zinc-300">
                  {url}
                </code>
                <button
                  type="button"
                  onClick={() => copyUrl(p.customName)}
                  className="shrink-0 rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700"
                >
                  {copied === p.customName ? "Copied" : "Copy"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
