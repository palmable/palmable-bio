import Link from "next/link";
import { auth, isAuthConfigured } from "@/lib/auth";
import { login, logout } from "@/app/actions";
import { getSitesByOwner } from "@/lib/sites-write";
import { DeleteSiteButton } from "./DeleteSiteButton";
import { NewSiteForm } from "./NewSiteForm";

export default async function DashboardPage() {
  const session = await auth();
  const email = session?.user?.email;

  // Signed out (or auth not configured): show a sign-in prompt instead of the app.
  if (!email) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="text-4xl">🌴</p>
        <h1 className="text-2xl font-bold">Sign in to Palmable</h1>
        {isAuthConfigured() ? (
          <form action={login}>
            <button className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background">
              Continue with Google
            </button>
          </form>
        ) : (
          <p className="max-w-sm text-sm opacity-60">
            Google sign-in isn&apos;t configured yet. Add{" "}
            <code>AUTH_GOOGLE_ID</code>, <code>AUTH_GOOGLE_SECRET</code> and{" "}
            <code>AUTH_SECRET</code> to <code>.env.local</code> — see{" "}
            <code>docs/google-sheets-setup.md</code>.
          </p>
        )}
        <Link href="/" className="text-sm underline opacity-60">
          Back home
        </Link>
      </main>
    );
  }

  let sites: Awaited<ReturnType<typeof getSitesByOwner>> = [];
  let sheetsError: string | null = null;
  try {
    sites = await getSitesByOwner(email);
  } catch (err) {
    sheetsError =
      err instanceof Error ? err.message : "Could not load your pages from Google Sheets.";
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-6 px-6 py-10">
      {sheetsError ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm"
        >
          <p className="font-medium">Google Sheets connection failed</p>
          <p className="mt-1 opacity-80">{sheetsError}</p>
          <p className="mt-2 opacity-70">
            Enable the Google Sheets API for your Cloud project, share the spreadsheet
            with your service account email, then refresh this page.
          </p>
        </div>
      ) : null}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your pages</h1>
          <p className="text-sm opacity-60">{email}</p>
        </div>
        <form action={logout}>
          <button className="rounded-lg border px-3 py-1.5 text-sm">
            Sign out
          </button>
        </form>
      </header>

      {sites.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {sites.map((site) => (
            <li
              key={site.slug}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <div>
                <p className="font-semibold">{site.title}</p>
                <p className="text-sm opacity-60">
                  palmable.bio/{site.slug}
                  {site.published ? "" : " · draft"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  href={`/editor/${site.slug}`}
                  className="rounded-lg bg-foreground px-3 py-1.5 font-medium text-background"
                >
                  Edit
                </Link>
                <Link
                  href={`/${site.slug}`}
                  className="rounded-lg border px-3 py-1.5"
                >
                  View
                </Link>
                <DeleteSiteButton slug={site.slug} title={site.title} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm opacity-60">No pages yet — create your first one.</p>
      )}

      {!sheetsError ? <NewSiteForm /> : null}
    </main>
  );
}
