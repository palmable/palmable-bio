import { Readable } from "stream";
import { google } from "googleapis";
import type { UserDriveAuth } from "./auth";
import type { SiteImageKind } from "./uploads";
import { driveFileUrl } from "./drive-url";

const UPLOAD_FOLDER = "Palmable uploads";

function formatUserDriveError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("insufficient") || message.includes("Insufficient Permission")) {
    return "Google Drive access not granted. Sign out, then sign in again and accept Drive permission.";
  }
  if (message.includes("403") || message.includes("Forbidden")) {
    return "Drive access denied. Enable the Google Drive API in Google Cloud Console, then sign in again.";
  }

  return `Drive upload failed: ${message}`;
}

async function getOAuth2Client(userAuth: UserDriveAuth) {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google sign-in is not configured.");
  }

  if (!userAuth.accessToken && !userAuth.refreshToken) {
    throw new Error(
      "Google Drive access missing. Sign out, then sign in again to grant upload permission."
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({
    access_token: userAuth.accessToken,
    refresh_token: userAuth.refreshToken,
    expiry_date: userAuth.expiresAt ? userAuth.expiresAt * 1000 : undefined,
  });

  const expired =
    userAuth.expiresAt !== undefined &&
    Date.now() >= userAuth.expiresAt * 1000 - 60_000;

  if (expired) {
    if (!userAuth.refreshToken) {
      throw new Error("Google session expired. Sign out and sign in again.");
    }
    const { credentials } = await oauth2.refreshAccessToken();
    oauth2.setCredentials(credentials);
  }

  return oauth2;
}

async function getOrCreateUploadFolder(
  drive: ReturnType<typeof google.drive>
): Promise<string> {
  const existing = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${UPLOAD_FOLDER}' and trashed=false`,
    fields: "files(id)",
    spaces: "drive",
    pageSize: 1,
  });

  const folderId = existing.data.files?.[0]?.id;
  if (folderId) return folderId;

  const created = await drive.files.create({
    requestBody: {
      name: UPLOAD_FOLDER,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  if (!created.data.id) throw new Error("Could not create upload folder in Drive.");
  return created.data.id;
}

/** Upload to the signed-in user's personal Google Drive (My Drive). */
export async function uploadImageToUserDrive(
  slug: string,
  kind: SiteImageKind,
  file: File,
  ext: string,
  userAuth: UserDriveAuth
): Promise<string> {
  try {
    const auth = await getOAuth2Client(userAuth);
    const drive = google.drive({ version: "v3", auth });

    const folderId = await getOrCreateUploadFolder(drive);
    const filename = `${slug}-${kind}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const created = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: Readable.from(buffer),
      },
      fields: "id",
    });

    const fileId = created.data.id;
    if (!fileId) throw new Error("no file id returned");

    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });

    return driveFileUrl(fileId);
  } catch (err) {
    throw new Error(formatUserDriveError(err));
  }
}
