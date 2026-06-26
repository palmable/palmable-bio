// One-time seed: pushes the demo "siri-cafe" site into the Google Sheet.
// Usage: load your .env.local, then `npm run sheet:seed`.
//
// Safe to re-run: it upserts the row by slug rather than duplicating it.

import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { readFileSync } from "node:fs";

// Minimal .env.local loader (avoids adding a dotenv dependency).
function loadEnv() {
  try {
    const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (!(m[1] in process.env)) process.env[m[1]] = val;
    }
  } catch {
    // No .env.local — rely on the ambient environment.
  }
}
loadEnv();

const SITES_HEADERS = [
  "slug",
  "title",
  "description",
  "theme",
  "blocks",
  "published",
  "ownerEmail",
  "updatedAt",
];

const demo = {
  slug: "siri-cafe",
  title: "Siri Café",
  description: "Specialty coffee & homemade bakes in the heart of Bangkok.",
  theme: { accent: "#b45309", background: "#fdf8f3", text: "#2b2118" },
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
        { name: "Iced Latte", description: "House blend, Chiang Rai beans.", price: "฿85" },
        { name: "Butter Croissant", description: "Baked fresh every morning.", price: "฿70" },
        { name: "Matcha Cheesecake", description: "Uji matcha, light & creamy.", price: "฿120" },
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
};

async function main() {
  const { GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } = process.env;
  if (!GOOGLE_SHEETS_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.error("Missing GOOGLE_SHEETS_* env vars. Fill .env.local first.");
    process.exit(1);
  }

  const auth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_ID, auth);
  await doc.loadInfo();

  let sheet = doc.sheetsByTitle["Sites"];
  if (!sheet) {
    sheet = await doc.addSheet({ title: "Sites", headerValues: SITES_HEADERS });
  }

  const record = {
    slug: demo.slug,
    title: demo.title,
    description: demo.description,
    theme: JSON.stringify(demo.theme),
    blocks: JSON.stringify(demo.blocks),
    published: "TRUE",
    ownerEmail: "demo@palmable.bio",
    updatedAt: new Date().toISOString(),
  };

  const rows = await sheet.getRows();
  const existing = rows.find((r) => r.get("slug") === demo.slug);
  if (existing) {
    existing.assign(record);
    await existing.save();
    console.log(`Updated existing row for "${demo.slug}".`);
  } else {
    await sheet.addRow(record);
    console.log(`Added new row for "${demo.slug}".`);
  }
  console.log(`Done. Open /${demo.slug} to view it.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
