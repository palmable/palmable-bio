# Using Google Sheets as the database

Palmable stores each bio page as a row in one Google Sheet. This guide gets you
from zero to a working connection in ~10 minutes.

> Until these env vars are set, the app falls back to built-in seed data, so you
> can run `npm run dev` and view `/siri-cafe` with no setup at all.

## 1. Create the spreadsheet

1. Create a new Google Sheet (any name).
2. From the URL, copy the **spreadsheet ID**:
   `https://docs.google.com/spreadsheets/d/`**`<THIS_PART>`**`/edit`
3. You don't need to add a tab or headers — the app creates a `Sites` tab with
   the right columns on first write (and `npm run sheet:seed` does it too).

The `Sites` tab columns are:

| slug | title | description | theme | blocks | published | ownerEmail | updatedAt |
|------|-------|-------------|-------|--------|-----------|------------|-----------|

`theme` and `blocks` hold JSON strings. `published` is `TRUE`/`FALSE`.

## 2. Create a Google service account

A service account is a robot Google account the server uses to read/write the
sheet — no human OAuth login needed.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create
   (or pick) a project.
2. Enable the **Google Sheets API** for that project
   (APIs & Services → Library → "Google Sheets API" → **Enable**).
   If you also use Google sign-in, enable it on the **same** Cloud project as
   your OAuth client and service account.
3. APIs & Services → **Credentials** → Create credentials → **Service account**.
   Give it a name (e.g. `palmable`) and create it.
4. Open the service account → **Keys** → Add key → **Create new key** → **JSON**.
   A `.json` file downloads. Inside it you'll find `client_email` and
   `private_key`.

## 3. Share the sheet with the service account

Open your spreadsheet → **Share** → paste the service account's `client_email`
(looks like `palmable@my-project.iam.gserviceaccount.com`) → give it **Editor**
access → Send. **This step is required**, or the API returns 403.

## 4. Set environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

- `GOOGLE_SHEETS_ID` — the ID from step 1.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` — `client_email` from the JSON.
- `GOOGLE_PRIVATE_KEY` — `private_key` from the JSON, **in double quotes**, with
  its `\n` escapes left intact, e.g.
  `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`.
- `GOOGLE_DRIVE_FOLDER_ID` (optional but recommended) — for image uploads. See
  step 4b below.

## 4b. Image uploads via Google Drive (optional)

Profile photos, covers, and post images upload to Google Drive when
`GOOGLE_DRIVE_FOLDER_ID` is set. Without it, files save to `public/uploads/`
(local dev only — they disappear on serverless hosts like Vercel).

1. Enable the **Google Drive API** on the same Cloud project.
2. In Google Drive, create a folder (e.g. `Palmable uploads`).
3. **Share** the folder with your service account email → **Editor**.
4. Copy the folder ID from the URL:
   `https://drive.google.com/drive/folders/`**`<THIS_PART>`**
5. Set `GOOGLE_DRIVE_FOLDER_ID` in `.env.local`.

Uploaded files are made **publicly readable** (anyone with the link) so they
render on bio pages.

## 5. Seed the demo row (optional) and run

```bash
npm run sheet:seed   # pushes the demo "siri-cafe" site into the sheet
npm run dev
```

Open <http://localhost:3000/siri-cafe>. Edit the row in Google Sheets and the
page updates within the cache window (reads are cached for up to 1 hour; the
editor will invalidate instantly via cache tags once M2 lands).

## 6. Google sign-in (dashboard & editor)

Human sign-in uses Auth.js + a Google OAuth **Web application** client (separate
from the service account in step 2).

1. In the same Cloud project, APIs & Services → **Credentials** → Create
   credentials → **OAuth client ID** → Application type **Web application**.
2. Under **Authorized redirect URIs**, add exactly:
   `http://localhost:3000/api/auth/callback/google`
   (Add your production URL later: `https://your-domain/api/auth/callback/google`.)
3. Copy the client ID and secret into `.env.local`:
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
4. Generate `AUTH_SECRET` (`openssl rand -base64 32`) and set
   `AUTH_URL=http://localhost:3000`.
5. **Always open the app at that same URL** — e.g. `http://localhost:3000`, not
   `http://127.0.0.1:3000` or a different port. If Next.js falls back to port
   3001, stop other dev servers and restart. A port/host mismatch causes
   `redirect_uri_mismatch` or Auth.js `InvalidCheck` (PKCE) errors.
6. Sign in at `/dashboard`.

## Notes & limits

- **Caching is essential.** The Sheets API allows ~60 reads/min per user. All
  public reads go through `unstable_cache` (1-hour revalidate) in
  `src/lib/sites.ts`, so traffic hits the cache, not Sheets.
- **Good for MVP scale.** Sheets is fine for hundreds of sites and modest
  traffic. If you outgrow it, `src/lib/sites.ts` is the only file to swap — the
  rest of the app depends on its `getSiteBySlug` / `getAllSlugs` interface, not
  on Sheets directly.
