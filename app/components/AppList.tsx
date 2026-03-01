"use client";

import { useEffect, useState } from "react";

type App = { id: string; slug: string; supabaseUrl: string; createdAt: Date };

export function AppList({
  initial,
  baseUrl,
}: {
  initial: App[];
  baseUrl: string;
}) {
  const [apps, setApps] = useState(initial);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setApps(initial);
  }, [initial]);

  async function copyUrl(slug: string) {
    const url = `${baseUrl}/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  if (apps.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-200">Your proxies</h2>
      <ul className="divide-y divide-zinc-700 rounded-lg border border-zinc-700/50">
        {apps.map((a) => {
          const url = `${baseUrl}/${a.slug}`;
          return (
            <li
              key={a.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-zinc-100">{a.slug}</p>
                <p className="truncate text-sm text-zinc-500">{a.supabaseUrl}</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="truncate rounded bg-zinc-800/80 px-3 py-1.5 text-sm text-zinc-300">
                  {url}
                </code>
                <button
                  type="button"
                  onClick={() => copyUrl(a.slug)}
                  className="shrink-0 rounded border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700"
                >
                  {copied === a.slug ? "Copied" : "Copy"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
