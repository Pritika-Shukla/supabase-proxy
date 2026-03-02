import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GoogleButton from "./GoogleButton";

export const metadata: Metadata = {
  title: "Sign In — Supabase Proxy",
  robots: { index: false, follow: false },
};

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#1a1a2e] opacity-40 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#16213e] opacity-30 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#e94560]/10 blur-[100px]" />
      </div>

      {/* Subtle grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-[400px] px-6">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-md">
          
          {/* ✅ Client Button */}
          <GoogleButton />

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-[12px] uppercase tracking-[0.1em] text-white/20">
              secure login
            </span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <p className="mt-5 text-center text-[13px] leading-relaxed text-white/30">
            We&apos;ll create your account automatically
            <br />
            if you don&apos;t have one yet.
          </p>
        </div>

        <p className="mt-8 text-center text-[12px] text-white/20">
          By signing in, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}