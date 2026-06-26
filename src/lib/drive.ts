import { Readable } from "stream";
import { google } from "googleapis";
import { isGoogleServiceAccountConfigured } from "./google-auth";
import type { SiteImageKind } from "./uploads";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

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
    fields: "id",
  });

  const fileId = created.data.id;
  if (!fileId) throw new Error("Drive upload failed — no file id returned.");

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
