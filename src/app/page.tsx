import Link from "next/link";

// Temporary landing page. The real marketing site ("One button" hooks etc.)
// lands in M4 — for now this just routes to the live demo bio page.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col gap-3">
        <p className="text-5xl">🌴</p>
        <h1 className="text-4xl font-bold tracking-tight">Palmable</h1>
        <p className="text-lg opacity-70">
          Your whole business on one tappable page. Live in 5 minutes.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Get started — it&apos;s free
          </Link>
          <Link
            href="/siri-cafe"
            className="rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/[.04]"
          >
            View the live demo →
          </Link>
        </div>
        <span className="text-xs opacity-40">Sign in to build your own page</span>
      </div>
    </main>
  );
}
