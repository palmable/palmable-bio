// Google Sheets connection layer (server-only).
//
// One spreadsheet acts as the database. A tab named "Sites" holds one row per
// bio page; the `theme` and `blocks` columns store JSON strings, which maps
// cleanly onto our already-serializable Block model.
//
// Configure via env vars (see .env.example):
//   GOOGLE_SHEETS_ID                – the spreadsheet ID from its URL
//   GOOGLE_SERVICE_ACCOUNT_EMAIL    – service account email (…@…iam.gserviceaccount.com)
//   GOOGLE_PRIVATE_KEY              – service account private key (PEM)
//
// The service account must be granted access to the sheet (share the sheet
// with the service account email, Editor role).

import { GoogleSpreadsheet, type GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export const SITES_SHEET = "Sites";

/** Column headers for the Sites tab, in order. */
export const SITES_HEADERS = [
  "slug",
  "title",
  "description",
  "theme", // JSON
  "blocks", // JSON
  "published", // "TRUE" / "FALSE"
  "ownerEmail",
  "updatedAt", // ISO string
] as const;

/** True when all required Google credentials are present in the environment. */
export function isSheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEETS_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
  );
}

function getAuth(): JWT {
  // Private keys pasted into .env have literal "\n" sequences; restore them.
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

// Memoize the loaded document across calls within a single server runtime.
let docPromise: Promise<GoogleSpreadsheet> | null = null;

async function getDoc(): Promise<GoogleSpreadsheet> {
  if (!docPromise) {
    docPromise = (async () => {
      try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID!, getAuth());
        await doc.loadInfo();
        return doc;
      } catch (err) {
        docPromise = null;
        throw err;
      }
    })();
  }
  return docPromise;
}

/**
 * Return the "Sites" worksheet, creating it (with headers) if missing.
 * Lets a brand-new empty spreadsheet self-initialize on first write.
 */
export async function getSitesSheet(): Promise<GoogleSpreadsheetWorksheet> {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle[SITES_SHEET];
  if (!sheet) {
    sheet = await doc.addSheet({
      title: SITES_SHEET,
      headerValues: [...SITES_HEADERS],
    });
  }
  return sheet;
}
