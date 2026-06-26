import Link from "next/link";

export default function SiteNotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl">🌴</p>
      <h1 className="text-xl font-semibold">This page isn&apos;t here</h1>
      <p className="text-sm opacity-60">
        No Palmable site exists at this address yet, or it hasn&apos;t been published.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
      >
        Back home
      </Link>
    </main>
  );
}
