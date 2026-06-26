import type { GalleryImage } from "@/lib/types";

/** Title for display; falls back to legacy `caption` field. */
export function postTitle(post: GalleryImage): string {
  return post.title?.trim() || post.caption?.trim() || "";
}

/** Body text for the detail view. */
export function postBody(post: GalleryImage): string {
  return post.body?.trim() || "";
}
