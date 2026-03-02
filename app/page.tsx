import { auth } from "@/auth";
import { getApps } from "@/app/actions";
import { CreateAppForm } from "@/app/components/CreateAppForm";
import { AppList } from "@/app/components/AppList";
import { getBaseUrl, getProxyBaseUrl } from "@/lib/utils";
import LogoutButton from "./components/LogoutButton";

export default async function DashboardPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const apps = isLoggedIn ? await getApps() : [];
  const baseUrl = getBaseUrl();
  const proxyBaseUrl = getProxyBaseUrl();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-green-500/10 blur-[140px]" />
        <div className="animate-float-reverse absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-emerald-600/8 blur-[120px]" />
        <div className="animate-pulse-glow absolute left-1/2 top-1/4 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-green-400/5 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div className="grid-bg animate-grid-fade pointer-events-none absolute inset-0" />

      {/* Radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, transparent 0%, black 75%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 ring-1 ring-zinc-800">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Supabase <span className="text-green-400">Proxy</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <span className="hidden text-sm text-zinc-500 sm:block">
                {session.user?.email}
              </span>
            )}
            {isLoggedIn && <LogoutButton />}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="mx-auto max-w-5xl px-6">
          {/* Hero */}
          <div className="animate-fade-in-up pb-4 pt-16 text-center sm:pt-24">

            <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {isLoggedIn ? (
                <>
                  Welcome back,{" "}
                  <span className="bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {session.user?.name?.split(" ")[0] ?? "User"}
                  </span>
                </>
              ) : (
                <>
                  Your Supabase.{" "}
                  <span className="bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Your Proxy.
                  </span>
                </>
              )}
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Generate a secure proxy endpoint for your Supabase project in
              seconds. Hide your project URL and route through your own domain.
            </p>
          </div>

          {/* Features strip */}
          <div className="animate-fade-in-up delay-200 mx-auto mb-12 flex max-w-2xl flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Custom slugs</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Zero config</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Instant setup</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Full passthrough</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="animate-fade-in-up delay-300 grid gap-8 pb-20 lg:grid-cols-2">
            {/* Create proxy card */}
            <section className="rounded-2xl border border-zinc-900 bg-black p-8 transition-all duration-300">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    New Proxy
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Create a proxy endpoint
                  </p>
                </div>
              </div>
              <CreateAppForm isLoggedIn={isLoggedIn} />
            </section>

            {/* Code snippet card */}
            <section className="flex flex-col rounded-2xl border border-zinc-900 bg-black p-8 transition-all duration-300">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Quick Integration
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Drop-in replacement
                  </p>
                </div>
              </div>

              <div className="flex-1 rounded-xl border border-zinc-900 bg-black p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500/60" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <span className="h-3 w-3 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-zinc-600">app.ts</span>
                </div>

                <pre className="overflow-x-auto text-sm leading-relaxed">
                  <code>
                    <span className="text-zinc-200">import</span>
                    <span className="text-zinc-200">{" { "}</span>
                    <span className="text-zinc-200">createClient</span>
                    <span className="text-zinc-200">{" } "}</span>
                    <span className="text-zinc-200">from</span>
                    <span className="text-amber-300">{" '@supabase/supabase-js'"}</span>
                    {"\n\n"}
                    <span className="text-purple-400">const</span>
                    <span className="text-zinc-200">{" supabase"}</span>
                    <span className="text-zinc-200">{" = "}</span>
                    <span className="text-yellow-300">createClient</span>
                    <span className="text-zinc-200">{"("}</span>
                    {"\n"}
                    {apps.length > 0 ? (
                      <span className="text-green-400">{`  '${proxyBaseUrl}/${apps[0].slug}'`}</span>
                    ) : (
                      <span className="text-green-400">{`  'your-proxy-url'`}</span>
                    )}
                    <span className="text-zinc-200">,</span>
                    {"\n"}
                    <span className="text-green-400">{"  'your-anon-key'"}</span>
                    {"\n"}
                    <span className="text-zinc-200">{")"}</span>
                  </code>
                </pre>
              </div>

              <p className="mt-4 text-xs text-zinc-600">
                {apps.length > 0 ? (
                  <>
                    Replace <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-green-400/80">your-anon-key</code> with your Supabase anon key.
                  </>
                ) : (
                  <>
                    Create a proxy to see your URL here. Replace{" "}
                    <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-green-400/80">your-anon-key</code> with your Supabase anon key.
                  </>
                )}
              </p>
            </section>
          </div>

          {/* App list */}
          {isLoggedIn && (
            <div className="animate-fade-in-up delay-400 pb-20">
              <AppList initial={apps} baseUrl={proxyBaseUrl} />
            </div>
          )}

          {/* How it works */}
          <div className="animate-fade-in-up delay-500 border-t border-zinc-900 pb-20 pt-16">
            <h3 className="mb-10 text-center text-2xl font-bold text-white">
              How it <span className="text-green-400">works</span>
            </h3>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Create a slug",
                  desc: "Pick a unique slug for your proxy endpoint.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  ),
                },
                {
                  step: "02",
                  title: "Link Supabase",
                  desc: "Paste your Supabase project URL to connect.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                  ),
                },
                {
                  step: "03",
                  title: "Use your proxy",
                  desc: "Replace the Supabase URL in your client code.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="group relative rounded-2xl border border-zinc-900 bg-black p-6 transition-all duration-300 hover:bg-zinc-950"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 ring-1 ring-zinc-800 transition-all group-hover:ring-zinc-700">
                      {item.icon}
                    </div>
                    <span className="text-3xl font-bold text-green-500/10 transition-colors group-hover:text-green-500/20">
                      {item.step}
                    </span>
                  </div>
                  <h4 className="mb-2 text-base font-semibold text-white">
                    {item.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-zinc-500">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 py-6">
        <p className="text-center text-xs text-zinc-600">
          Built with Next.js &middot; proxy.pritika.xyz
        </p>
      </footer>
    </div>
  );
}
