import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Auth.js v5 with Google sign-in. Uses JWT sessions (no DB adapter needed —
// the Google account email is all we store, and it ties a user to their rows
// in the Sites sheet via the `ownerEmail` column).
//
// Reads AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from the env
// automatically. See docs/google-sheets-setup.md (auth section) for setup.
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Required in dev when AUTH_URL is set; safe behind a reverse proxy in prod.
  trustHost: true,
  providers: [Google],
});

/** True when Google OAuth credentials are present. */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

/** Returns the signed-in user's email, or throws (use inside Server Actions). */
export async function requireUserEmail(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("Unauthorized");
  return email;
}
