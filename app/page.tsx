import { auth } from "@/auth";
import { getApps } from "@/app/actions";
import { CreateAppForm } from "@/app/components/CreateAppForm";
import { AppList } from "@/app/components/AppList";
import { signOutAction } from "@/app/actions";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
 
}

export default async function DashboardPage() {
  const session = await auth();
  const apps = await getApps();
  const baseUrl = getBaseUrl();

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
            Create path-based proxies that forward to your Supabase project.
          </p>
        </div>

        <div className="space-y-10">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-200">
              New proxy
            </h3>
            <CreateAppForm />
          </section>

          <section>
            <AppList initial={apps} baseUrl={baseUrl} />
          </section>
        </div>

        <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/20 p-4">
          <h4 className="font-medium text-zinc-300">How it works</h4>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-500">
            <li>
              Create a proxy with slug, Supabase URL, and anon key
            </li>
            <li>
              Use <code className="rounded bg-zinc-800 px-1">{baseUrl}/my-app</code> as
              your Supabase URL (append paths like /rest/v1/...)
            </li>
            <li>REST, Auth, Storage, Functions, and GraphQL are supported</li>
            <li>
              <strong>WebSocket Realtime</strong> requires a VPS-based server;
              Next.js route handlers do not support WebSocket upgrades
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
