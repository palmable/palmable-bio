// Write + owner-scoped read operations against the Sites sheet (server-only).
// Public reads live in sites.ts (cached); these are used by the dashboard and
// editor, which need fresh, owner-filtered data and must never be cached.

import { revalidateTag } from "next/cache";
import type { Block, Site, Theme } from "./types";
import { getSitesSheet, isSheetsConfigured } from "./sheets";
import { siteTag } from "./sites";

const DEFAULT_THEME: Theme = {
  accent: "#171717",
  background: "#ffffff",
  text: "#171717",
};

export type SiteSummary = {
  slug: string;
  title: string;
  published: boolean;
};

/** Editable payload sent from the editor. */
export type SitePatch = {
  title: string;
  description?: string;
  theme: Theme;
  blocks: Block[];
  published: boolean;
};

function published(value: unknown): boolean {
  return String(value).toUpperCase() === "TRUE";
}

function assertConfigured() {
  if (!isSheetsConfigured()) {
    throw new Error(
      "Google Sheets is not configured. Set GOOGLE_SHEETS_* env vars to enable editing."
    );
  }
}

/** Build a starter site for a brand-new page. */
export function starterSite(slug: string, title: string): SitePatch {
  return {
    title,
    description: "",
    theme: DEFAULT_THEME,
    published: false,
    blocks: [
      { type: "header", name: title, tagline: "Add a short bio here" },
      {
        type: "socials",
        items: [
          { platform: "tiktok", href: "https://" },
          { platform: "instagram", href: "https://" },
          { platform: "threads", href: "https://" },
          { platform: "facebook", href: "https://" },
        ],
      },
      { type: "gallery", title: "Notes", images: [] },
    ],
  };
}

/** Normalize arbitrary text into a URL-safe slug. */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** All sites owned by `ownerEmail`, published or not. */
export async function getSitesByOwner(ownerEmail: string): Promise<SiteSummary[]> {
  assertConfigured();
  const sheet = await getSitesSheet();
  const rows = await sheet.getRows();
  return rows
    .filter((r) => r.get("ownerEmail") === ownerEmail)
    .map((r) => ({
      slug: r.get("slug") as string,
      title: r.get("title") as string,
      published: published(r.get("published")),
    }));
}

/** A single site owned by `ownerEmail` (includes unpublished). */
export async function getOwnedSite(
  ownerEmail: string,
  slug: string
): Promise<Site | null> {
  assertConfigured();
  const sheet = await getSitesSheet();
  const rows = await sheet.getRows();
  const row = rows.find(
    (r) => r.get("slug") === slug && r.get("ownerEmail") === ownerEmail
  );
  if (!row) return null;
  return {
    slug,
    title: row.get("title"),
    description: row.get("description") || undefined,
    published: published(row.get("published")),
    theme: safeParse<Theme>(row.get("theme"), DEFAULT_THEME),
    blocks: safeParse<Block[]>(row.get("blocks"), []),
  };
}

export async function slugTaken(slug: string): Promise<boolean> {
  assertConfigured();
  const sheet = await getSitesSheet();
  const rows = await sheet.getRows();
  return rows.some((r) => r.get("slug") === slug);
}

/** Create a new site owned by `ownerEmail`. Throws if the slug is taken. */
export async function createSite(
  ownerEmail: string,
  slug: string,
  title: string
): Promise<void> {
  assertConfigured();
  if (await slugTaken(slug)) {
    throw new Error(`The address "${slug}" is already taken.`);
  }
  const sheet = await getSitesSheet();
  const patch = starterSite(slug, title);
  await sheet.addRow({
    slug,
    title: patch.title,
    description: patch.description ?? "",
    theme: JSON.stringify(patch.theme),
    blocks: JSON.stringify(patch.blocks),
    published: patch.published ? "TRUE" : "FALSE",
    ownerEmail,
    updatedAt: new Date().toISOString(),
  });
  revalidateTag("sites", "max");
  revalidateTag(siteTag(slug), "max");
}

/** Update a site. Verifies the caller owns it before writing. */
export async function updateSite(
  ownerEmail: string,
  slug: string,
  patch: SitePatch
): Promise<void> {
  assertConfigured();
  const sheet = await getSitesSheet();
  const rows = await sheet.getRows();
  const row = rows.find((r) => r.get("slug") === slug);
  if (!row) throw new Error("Site not found.");
  if (row.get("ownerEmail") !== ownerEmail) {
    throw new Error("You don't have permission to edit this site.");
  }
  row.assign({
    title: patch.title,
    description: patch.description ?? "",
    theme: JSON.stringify(patch.theme),
    blocks: JSON.stringify(patch.blocks),
    published: patch.published ? "TRUE" : "FALSE",
    updatedAt: new Date().toISOString(),
  });
  await row.save();
  revalidateTag("sites", "max");
  revalidateTag(siteTag(slug), "max");
}

/** Delete a site. Verifies the caller owns it before removing the row. */
export async function deleteSite(ownerEmail: string, slug: string): Promise<void> {
  assertConfigured();
  const sheet = await getSitesSheet();
  const rows = await sheet.getRows();
  const row = rows.find(
    (r) => r.get("slug") === slug && r.get("ownerEmail") === ownerEmail
  );
  if (!row) throw new Error("Site not found.");
  await row.delete();
  revalidateTag("sites", "max");
  revalidateTag(siteTag(slug), "max");
}

function safeParse<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
