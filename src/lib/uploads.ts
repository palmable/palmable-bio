import { mkdir, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type SiteImageKind = "avatar" | "cover" | "post";

/** Persist an uploaded image under `public/uploads/{slug}/` and return its public URL. */
export async function saveSiteImage(
  slug: string,
  kind: SiteImageKind,
  file: File
): Promise<string> {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Invalid site.");
  }
  if (!ALLOWED.has(file.type)) {
    throw new Error("Please upload a JPEG, PNG, WebP, or GIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const ext = EXT[file.type] ?? "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", slug);
  await mkdir(dir, { recursive: true });

  const filename = `${kind}-${Date.now()}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return `/uploads/${slug}/${filename}`;
}
