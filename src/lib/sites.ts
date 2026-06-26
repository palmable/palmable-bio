import { unstable_cache } from "next/cache";
import type { Block, Site, Theme } from "./types";
import { getSitesSheet, isSheetsConfigured } from "./sheets";

const DEFAULT_THEME: Theme = {
  accent: "#171717",
  background: "#ffffff",
  text: "#171717",
};

// --- Seed data ---------------------------------------------------------------
// Used as a fallback when Google Sheets is not configured, so the app runs
// locally with zero setup. Once GOOGLE_SHEETS_* env vars are present, all reads
// go to the spreadsheet instead.

const SEED: Site[] = [
  {
    slug: "siri-cafe",
    title: "Siri Café",
    description: "Specialty coffee & homemade bakes in the heart of Bangkok.",
    theme: DEFAULT_THEME,
    blocks: [
      {
        type: "header",
        name: "Siri Café",
        tagline: "Specialty coffee & homemade bakes ☕️🥐",
        avatarUrl:
          "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=200&h=200&fit=crop",
        coverUrl:
          "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=900&h=400&fit=crop",
      },
      {
        type: "links",
        items: [
          { label: "Order on GrabFood", href: "#", icon: "🛵", featured: true },
          { label: "Book a table", href: "#", icon: "📅" },
          { label: "View full menu (PDF)", href: "#", icon: "📄" },
        ],
      },
      {
        type: "menu",
        title: "Today's favourites",
        items: [
          {
            name: "Iced Latte",
            description: "House blend, single origin Chiang Rai beans.",
            price: "฿85",
            imageUrl:
              "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=160&h=160&fit=crop",
          },
          {
            name: "Butter Croissant",
            description: "Baked fresh every morning.",
            price: "฿70",
            imageUrl:
              "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=160&h=160&fit=crop",
          },
          {
            name: "Matcha Cheesecake",
            description: "Uji matcha, light & creamy.",
            price: "฿120",
            imageUrl:
              "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=160&h=160&fit=crop",
          },
        ],
      },
      {
        type: "hours",
        title: "Opening hours",
        rows: [
          { day: "Mon – Fri", hours: "7:00 – 18:00" },
          { day: "Sat – Sun", hours: "8:00 – 17:00" },
        ],
      },
      {
        type: "contact",
        title: "Find us",
        phone: "+66 2 123 4567",
        email: "hello@siricafe.example",
        address: "12 Sukhumvit Soi 31, Bangkok 10110",
        mapUrl: "https://maps.google.com/?q=Sukhumvit+Soi+31+Bangkok",
      },
      {
        type: "socials",
        items: [
          { platform: "instagram", href: "#" },
          { platform: "facebook", href: "#" },
          { platform: "line", href: "#" },
          { platform: "tiktok", href: "#" },
        ],
      },
    ],
  },
];

export { SEED };

// --- Row <-> Site mapping ----------------------------------------------------

type SiteRow = {
  slug: string;
  title: string;
  description: string;
  theme: string;
  blocks: string;
  published: string;
  ownerEmail: string;
  updatedAt: string;
};

function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function isPublished(value: string | undefined): boolean {
  return String(value).toUpperCase() === "TRUE";
}

function rowToSite(row: SiteRow): Site {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description || undefined,
    theme: parseJson<Theme>(row.theme, DEFAULT_THEME),
    blocks: parseJson<Block[]>(row.blocks, []),
  };
}

// --- Source readers (uncached) ----------------------------------------------

async function fetchSiteFromSource(slug: string): Promise<Site | null> {
  if (!isSheetsConfigured()) {
    return SEED.find((s) => s.slug === slug) ?? null;
  }
  const sheet = await getSitesSheet();
  const rows = await sheet.getRows<SiteRow>();
  const row = rows.find(
    (r) => r.get("slug") === slug && isPublished(r.get("published"))
  );
  return row ? rowToSite(row.toObject() as SiteRow) : null;
}

async function fetchAllSlugsFromSource(): Promise<string[]> {
  if (!isSheetsConfigured()) {
    return SEED.map((s) => s.slug);
  }
  const sheet = await getSitesSheet();
  const rows = await sheet.getRows<SiteRow>();
  return rows
    .filter((r) => isPublished(r.get("published")))
    .map((r) => r.get("slug") as string);
}

// --- Public, cached accessors ------------------------------------------------
// Reads are cached (Sheets is slow + rate-limited). Each site is tagged so the
// editor can invalidate exactly one page on save via revalidateTag.

export async function getSiteBySlug(slug: string): Promise<Site | null> {
  const cached = unstable_cache(
    () => fetchSiteFromSource(slug),
    ["site-by-slug", slug],
    { tags: ["sites", `site:${slug}`], revalidate: 3600 }
  );
  return cached();
}

export async function getAllSlugs(): Promise<string[]> {
  const cached = unstable_cache(fetchAllSlugsFromSource, ["all-slugs"], {
    tags: ["sites"],
    revalidate: 3600,
  });
  return cached();
}

/** Cache tag for a single site — use with revalidateTag after writes. */
export function siteTag(slug: string): string {
  return `site:${slug}`;
}
