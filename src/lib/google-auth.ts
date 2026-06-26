import { JWT } from "google-auth-library";

/** True when service account credentials are present. */
export function isGoogleServiceAccountConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY
  );
}

/** JWT client for Google APIs (Sheets, Drive, etc.). */
export function createServiceAccountAuth(scopes: string[]): JWT {
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key,
    scopes,
  });
}
