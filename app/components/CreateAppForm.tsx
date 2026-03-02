"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { createApp } from "@/app/actions";

const DRAFT_KEY = "proxy-form-draft";

export function CreateAppForm({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const slugRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const { slug, supabaseUrl } = JSON.parse(saved);
        if (slugRef.current && slug) slugRef.current.value = slug;
        if (urlRef.current && supabaseUrl) urlRef.current.value = supabaseUrl;
        if (isLoggedIn) localStorage.removeItem(DRAFT_KEY);
      }
    } catch {}
  }, [isLoggedIn]);

  const closeOnEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    },
    []
  );

  useEffect(() => {
    if (showModal) {
      document.addEventListener("keydown", closeOnEsc);
      return () => document.removeEventListener("keydown", closeOnEsc);
    }
  }, [showModal, closeOnEsc]);

  function saveDraft() {
    const slug = slugRef.current?.value ?? "";
    const supabaseUrl = urlRef.current?.value ?? "";
    if (slug || supabaseUrl) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ slug, supabaseUrl }));
    }
  }

  async function handleSubmit(formData: FormData) {
    if (!isLoggedIn) {
      saveDraft();
      setShowModal(true);
      return;
    }
    setError(null);
    setCreatedUrl(null);
    const result = await createApp(null, formData);
    if (result.success) {
      localStorage.removeItem(DRAFT_KEY);
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
    <>
      <div className="space-y-6">
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="slug"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Slug
            </label>
            <input
              ref={slugRef}
              id="slug"
              name="slug"
              type="text"
              required
              placeholder="my-app"
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="mt-1 text-xs text-zinc-500">
              3–50 chars, lowercase alphanumeric and hyphens. 
            
            </p>
          </div>
          <div>
            <label
              htmlFor="supabaseUrl"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Supabase project URL
            </label>
            <input
              ref={urlRef}
              id="supabaseUrl"
              name="supabaseUrl"
              type="url"
              required
              placeholder="https://abc.supabase.co"
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
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
       
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-sm mx-4 rounded-2xl border border-zinc-700/50 bg-zinc-900 p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="text-lg font-semibold text-zinc-100">
              Sign in required
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Sign in with your Google account to create a proxy.
            </p>

            <button
              type="button"
              onClick={() => {
                saveDraft();
                signIn("google", { callbackUrl: "/" });
              }}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-[15px] font-medium text-[#1a1a1a] transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77.01-.54z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-700/50" />
              <span className="text-[11px] uppercase tracking-widest text-zinc-600">
                secure login
              </span>
              <div className="h-px flex-1 bg-zinc-700/50" />
            </div>

            <p className="mt-4 text-center text-xs text-zinc-500">
              We&apos;ll create your account automatically if you don&apos;t have one yet.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
