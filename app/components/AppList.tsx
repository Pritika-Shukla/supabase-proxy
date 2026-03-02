"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteApp } from "@/app/actions";

type App = { id: string; slug: string; supabaseUrl: string; createdAt: Date };

export function AppList({
  initial,
  baseUrl,
}: {
  initial: App[];
  baseUrl: string;
}) {
  const router = useRouter();
  const [apps, setApps] = useState(initial);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setApps(initial);
  }, [initial]);

  async function copyUrl(slug: string) {
    const url = `${baseUrl}/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this proxy? This cannot be undone.")) return;
    setDeleting(id);
    const result = await deleteApp(id);
    setDeleting(null);
    if (result.success) {
      setApps((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    } else {
      alert(result.error ?? "Failed to delete");
    }
  }

  if (apps.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Your Proxies</h2>
          <p className="text-sm text-zinc-500">{apps.length} active {apps.length === 1 ? "endpoint" : "endpoints"}</p>
        </div>
      </div>

      <div className="space-y-3">
        {apps.map((a) => {
          const url = `${baseUrl}/${a.slug}`;
          return (
            <div
              key={a.id}
              className="group rounded-xl border border-zinc-900 bg-black p-5 transition-all duration-300 hover:bg-zinc-950"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    <p className="font-semibold text-white">{a.slug}</p>
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-600">{a.supabaseUrl}</p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="truncate rounded-lg border border-zinc-900 bg-black px-3 py-1.5 text-sm text-green-400/80">
                    {url}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyUrl(a.slug)}
                    className="cursor-pointer shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-green-400 transition-all hover:bg-zinc-800"
                  >
                    {copied === a.slug ? "Copied!" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    disabled={deleting === a.id}
                    className="cursor-pointer shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-red-400/80 transition-all hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {deleting === a.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
