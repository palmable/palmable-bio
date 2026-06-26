import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { UserDriveAuth } from "./auth";
import { uploadImageToUserDrive } from "./drive-user";
import { isDriveConfigured, uploadImageToServiceAccountDrive } from "./drive";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type SiteImageKind = "avatar" | "cover" | "post";

function isServerlessHost(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

function validateImage(slug: string, file: File): string {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Invalid site.");
  }
  if (!ALLOWED.has(file.type)) {
    throw new Error("Please upload a JPEG, PNG, WebP, or GIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }
  return EXT[file.type] ?? "jpg";
}

async function saveSiteImageLocally(
  slug: string,
  kind: SiteImageKind,
  file: File,
  ext: string
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads", slug);
  await mkdir(dir, { recursive: true });

  const filename = `${kind}-${Date.now()}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return `/uploads/${slug}/${filename}`;
}

/**
 * Persist an uploaded image and return its public URL.
 * Prefers the signed-in user's personal Drive; falls back to service-account
 * Shared drive, then local disk (dev only).
 */
export async function saveSiteImage(
  slug: string,
  kind: SiteImageKind,
  file: File,
  userAuth?: UserDriveAuth | null
): Promise<string> {
  const ext = validateImage(slug, file);

  if (userAuth?.accessToken || userAuth?.refreshToken) {
    return uploadImageToUserDrive(slug, kind, file, ext, userAuth);
  }

  if (isDriveConfigured()) {
    return uploadImageToServiceAccountDrive(slug, kind, file, ext);
  }

  if (isServerlessHost()) {
    throw new Error(
      "Sign out, then sign in again with Google to upload images to your personal Drive."
    );
  }

  return saveSiteImageLocally(slug, kind, file, ext);
}
