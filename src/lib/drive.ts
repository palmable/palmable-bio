import { Readable } from "stream";
import { google } from "googleapis";
import { isGoogleServiceAccountConfigured } from "./google-auth";
import type { SiteImageKind } from "./uploads";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";

export function isDriveConfigured(): boolean {
  return Boolean(
    isGoogleServiceAccountConfigured() && process.env.GOOGLE_DRIVE_FOLDER_ID
  );
}

function getDriveAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: [DRIVE_SCOPE],
  });
}

function formatDriveError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("storage quota") || message.includes("storageQuotaExceeded")) {
    return "Drive upload failed: service accounts need a Shared drive folder (not personal My Drive). Create a Shared drive, add your service account as a member, and use that folder ID.";
  }
  if (message.includes("403") || message.includes("Forbidden")) {
    return "Drive access denied. Enable the Google Drive API, share the upload folder with your service account (Editor), and verify GOOGLE_DRIVE_FOLDER_ID.";
  }
  if (message.includes("404") || message.includes("not found")) {
    return "Drive folder not found. Check GOOGLE_DRIVE_FOLDER_ID in your environment.";
  }

  return `Drive upload failed: ${message}`;
}

/** Upload an image to a shared Drive folder and return a public view URL. */
export async function uploadImageToDrive(
  slug: string,
  kind: SiteImageKind,
  file: File,
  ext: string
): Promise<string> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error("Google Drive is not configured. Set GOOGLE_DRIVE_FOLDER_ID.");
  }

  try {
    const auth = getDriveAuth();
    const drive = google.drive({ version: "v3", auth });

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
      supportsAllDrives: true,
      fields: "id",
    });

    const fileId = created.data.id;
    if (!fileId) throw new Error("no file id returned");

    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
      supportsAllDrives: true,
    });

    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (err) {
    throw new Error(formatDriveError(err));
  }
}
