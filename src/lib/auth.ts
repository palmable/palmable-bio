import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

// Auth.js v5 with Google sign-in. Uses JWT sessions (no DB adapter needed —
// the Google account email is all we store, and it ties a user to their rows
// in the Sites sheet via the `ownerEmail` column).
//
// Image uploads use the signed-in user's personal Google Drive (OAuth token).
// Reads AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from the env
// automatically. See docs/google-sheets-setup.md (auth section) for setup.
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      authorization: {
        params: {
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "email",
            "profile",
            GOOGLE_DRIVE_SCOPE,
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      return session;
    },
  },
});

/** True when Google OAuth credentials are present. */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export type UserDriveAuth = {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
};

export function getUserDriveAuth(session: {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
} | null): UserDriveAuth | null {
  if (!session?.accessToken && !session?.refreshToken) return null;
  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
  };
}

/** Returns the signed-in user's email, or throws (use inside Server Actions). */
export async function requireUserEmail(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("Unauthorized");
  return email;
}
