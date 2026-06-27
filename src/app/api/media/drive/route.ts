import { NextResponse } from "next/server";

export const runtime = "nodejs";

function looksLikeImage(bytes: ArrayBuffer): boolean {
  const b = new Uint8Array(bytes.slice(0, 12));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return true; // JPEG
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return true; // PNG
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return true; // GIF
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) return true; // WEBP
  return false;
}

/** Stream a publicly shared Google Drive image for use in `<img>` tags. */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: "Invalid file id" }, { status: 400 });
  }

  const sources = [
    `https://lh3.googleusercontent.com/d/${id}=w2000`,
    `https://drive.google.com/thumbnail?id=${id}&sz=w2000`,
    `https://drive.google.com/uc?export=view&id=${id}`,
    `https://drive.google.com/uc?export=download&id=${id}`,
  ];

  for (const source of sources) {
    const res = await fetch(source, { redirect: "follow" });
    if (!res.ok) continue;

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("text/html")) continue;

    const bytes = await res.arrayBuffer();
    if (!looksLikeImage(bytes)) continue;

    const resolvedType = contentType.startsWith("image/")
      ? contentType.split(";")[0]
      : "image/jpeg";

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": resolvedType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  return NextResponse.json({ error: "Image not found" }, { status: 404 });
}
