/** Extract a Google Drive file id from common URL formats. */
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;

  if (url.startsWith("/api/media/drive")) {
    try {
      const id = new URL(url, "http://localhost").searchParams.get("id");
      return id && /^[a-zA-Z0-9_-]+$/.test(id) ? id : null;
    } catch {
      return null;
    }
  }

  try {
    const parsed = new URL(url);
    const id = parsed.searchParams.get("id");
    if (id && /^[a-zA-Z0-9_-]+$/.test(id)) return id;
  } catch {
    // Not an absolute URL — fall through.
  }

  const pathMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return pathMatch?.[1] ?? null;
}

/** App-relative URL that proxies a public Drive file for use in `<img src>`. */
export function getDriveProxyUrl(fileId: string): string {
  return `/api/media/drive?id=${encodeURIComponent(fileId)}`;
}

/** Map stored Drive links (and existing proxy URLs) to a browser-safe image src. */
export function resolveImageUrl(url: string | undefined): string {
  if (!url) return "";
  const fileId = extractDriveFileId(url);
  if (fileId) return getDriveProxyUrl(fileId);
  return url;
}

/** URL to store after upload — uses the proxy so `<img>` tags work reliably. */
export function driveFileUrl(fileId: string): string {
  return getDriveProxyUrl(fileId);
}
