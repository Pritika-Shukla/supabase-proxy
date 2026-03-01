"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProxy } from "@/app/actions";

export function CreateProxyForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setCreatedUrl(null);
    const result = await createProxy(null, formData);
    if (result.success) {
      setCreatedUrl(result.url);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function copyUrl() {
    if (!createdUrl) return;
    await navigator.clipboard.writeText(createdUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="projectId"
            className="mb-1.5 block text-sm font-medium text-zinc-300"
          >
            Supabase Project ID
          </label>
          <input
            id="projectId"
            name="projectId"
            type="text"
            required
            placeholder="zqzinuwgxnehqoykjngm"
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <p className="mt-1 text-xs text-zinc-500">
            From your Supabase project settings
          </p>
        </div>
        <div>
          <label
            htmlFor="customName"
            className="mb-1.5 block text-sm font-medium text-zinc-300"
          >
            Custom name
          </label>
          <input
            id="customName"
            name="customName"
            type="text"
            required
            placeholder="myapp"
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Alphanumeric + hyphens, 3–62 chars. Your URL:{" "}
            <span className="text-emerald-400">myapp.proxy.pritika.xyz</span>
          </p>
        </div>
        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50"
        >
          Create proxy
        </button>
      </form>
      {createdUrl && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="mb-2 text-sm font-medium text-emerald-400">
            Proxy created
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-zinc-800/80 px-3 py-2 text-sm text-zinc-200">
              {createdUrl}
            </code>
            <button
              type="button"
              onClick={copyUrl}
              className="shrink-0 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
