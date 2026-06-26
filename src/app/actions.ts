"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserEmail, signIn, signOut } from "@/lib/auth";
import {
  createSite,
  deleteSite,
  getOwnedSite,
  toSlug,
  updateSite,
  type SitePatch,
} from "@/lib/sites-write";
import { saveSiteImage, type SiteImageKind } from "@/lib/uploads";

// --- Auth ---

export async function login() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export type UploadImageResult = { url: string } | { error: string };

export async function uploadSiteImageAction(
  slug: string,
  kind: SiteImageKind,
  formData: FormData
): Promise<UploadImageResult> {
  try {
    const email = await requireUserEmail();
    const site = await getOwnedSite(email, slug);
    if (!site) return { error: "Site not found." };

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "No image selected." };
    }

    const url = await saveSiteImage(slug, kind, file);
    return { url };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Upload failed.",
    };
  }
}

// --- Site mutations (all verify ownership server-side) ---

export type CreateSiteResult = { error: string } | undefined;

export async function createSiteAction(
  _prev: CreateSiteResult,
  formData: FormData
): Promise<CreateSiteResult> {
  const email = await requireUserEmail();
  const title = String(formData.get("title") ?? "").trim();
  const slug = toSlug(String(formData.get("slug") ?? "") || title);

  if (!title) return { error: "Please enter your name." };
  if (!slug) return { error: "Please choose a valid address." };

  try {
    await createSite(email, slug, title);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create site." };
  }
  redirect(`/editor/${slug}`);
}

export async function saveSiteAction(
  slug: string,
  patch: SitePatch
): Promise<void> {
  const email = await requireUserEmail();
  await updateSite(email, slug, patch);
}

export async function deleteSiteAction(slug: string): Promise<void> {
  const email = await requireUserEmail();
  await deleteSite(email, slug);
  revalidatePath("/dashboard");
}
