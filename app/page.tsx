import { auth } from "@/auth";
import { getProxies } from "@/app/actions";
import { CreateProxyForm } from "@/app/components/CreateProxyForm";
import { ProxyList } from "@/app/components/ProxyList";
import { signOutAction } from "@/app/actions";

export default async function DashboardPage() {
  const session = await auth();
  const proxies = await getProxies();

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold text-zinc-100">
            Supabase Proxy
          </h1>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-zinc-100">
            Welcome, {session?.user?.name ?? "User"}
          </h2>
          <p className="mt-2 text-zinc-400">
            Create custom subdomains that proxy to your Supabase project.
          </p>
        </div>

        <div className="space-y-10">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-200">
              New proxy
            </h3>
            <CreateProxyForm />
          </section>

          <section>
            <ProxyList initial={proxies} />
          </section>
        </div>

        <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/20 p-4">
          <h4 className="font-medium text-zinc-300">How it works</h4>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-500">
            <li>Create a proxy with your Supabase project ID and a custom name</li>
            <li>Use <code className="rounded bg-zinc-800 px-1">myapp.proxy.pritika.xyz</code> as your Supabase URL</li>
            <li>Configure wildcard DNS: <code className="rounded bg-zinc-800 px-1">*.proxy.pritika.xyz → your server</code></li>
          </ul>
        </div>
      </main>
    </div>
  );
}
