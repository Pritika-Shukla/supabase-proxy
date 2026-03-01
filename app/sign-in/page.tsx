import type { Metadata } from "next";
import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In — AppStoreReject",
  robots: { index: false, follow: false },
};

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/");

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
      

        {/* Sign in card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-md">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-[15px] font-medium text-[#1a1a1a] transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="transition-transform duration-200 group-hover:scale-105"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </form>

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

        {/* Footer */}
        <p className="mt-8 text-center text-[12px] text-white/20">
          By signing in, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}