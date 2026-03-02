import { auth } from "@/auth";
import { getApps } from "@/app/actions";
import { CreateAppForm } from "@/app/components/CreateAppForm";
import { AppList } from "@/app/components/AppList";
import { getBaseUrl } from "@/lib/utils";
import LogoutButton from "./components/LogoutButton";

export default async function DashboardPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const apps = isLoggedIn ? await getApps() : [];
  const baseUrl = getBaseUrl();

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold text-zinc-100">
         Supabase Proxy
          </h1>
          {isLoggedIn && <LogoutButton />}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-zinc-100">
            {isLoggedIn
              ? `Welcome, ${session.user?.name ?? "User"}`
              : " Create your Supabase Proxy"}
          </h2>
          <p className="mt-2 text-zinc-400">
          Instantly generate a secure proxy endpoint for your Supabase project.
          </p>
        </div>

        <div className="space-y-10">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-200">
              New proxy
            </h3>
            <CreateAppForm isLoggedIn={isLoggedIn} />
          </section>

          {isLoggedIn && (
            <section>
              <AppList initial={apps} baseUrl={baseUrl} />
            </section>
          )}
        </div>

        <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/20 p-4">
          <h4 className="mb-3 font-medium text-zinc-300">Quick integration</h4>
          <pre className="overflow-x-auto rounded-lg bg-[#0d1117] p-4 text-sm leading-relaxed">
            <code>
              <span className="text-purple-400">import</span>
              <span className="text-zinc-300">{" { "}</span>
              <span className="text-sky-300">createClient</span>
              <span className="text-zinc-300">{" } "}</span>
              <span className="text-purple-400">from</span>
              <span className="text-emerald-400">{" '@supabase/supabase-js'"}</span>
              {"\n\n"}
              <span className="text-purple-400">const</span>
              <span className="text-sky-300">{" supabase"}</span>
              <span className="text-zinc-300">{" = "}</span>
              <span className="text-amber-300">createClient</span>
              <span className="text-zinc-300">{"("}</span>
              {"\n"}
              {apps.length > 0 ? (
                <span className="text-emerald-400">{`  '${baseUrl}/${apps[0].slug}'`}</span>
              ) : (
                <span className="text-emerald-400">{`  'your generated proxy URL here'`}</span>
              )}
              <span className="text-zinc-300">,</span>
              {"\n"}
              <span className="text-emerald-400">{"  'your-anon-key'"}</span>
              {"\n"}
              <span className="text-zinc-300">{")"}</span>
            </code>
          </pre>
          <p className="mt-2 text-xs text-zinc-500">
            {apps.length > 0 ? (
              <>
                Replace <code className="rounded bg-zinc-800 px-1">your-anon-key</code> with your Supabase anon key.
              </>
            ) : (
              <>
                Create a proxy above to see your slug here. Replace{" "}
                <code className="rounded bg-zinc-800 px-1">your-anon-key</code> with your Supabase anon key.
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
