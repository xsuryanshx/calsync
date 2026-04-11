# calsync

Personal unified view of two Google Calendar accounts. Read-only, local-first, manual-sync.

## One-time setup

### 1. Google Cloud OAuth client

1. Go to https://console.cloud.google.com/ → new project
2. Enable **Google Calendar API**
3. APIs & Services → OAuth consent screen → External, fill the minimums, add both your Gmail addresses as **Test users**
4. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID (type: **Web application**)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID + Client Secret

### 2. Environment variables

```bash
cp .env.local.example .env.local

# Generate random secrets for NEXTAUTH_SECRET and ENCRYPTION_KEY:
openssl rand -base64 32
openssl rand -base64 32
```

Fill in `.env.local` with the two secrets and the Google Client ID/Secret.

### 3. Install and run

```bash
npm install
npm run db:generate   # first run only
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/settings`. Click "Connect Google Account", authorize, then repeat for your second Google account (sign out of the first in Google first).

## Usage

- `/week` — unified week grid
- `/settings` — connect/reconnect Google accounts
- **Sync button** — pulls the latest events from both accounts

## Development

```bash
npm test              # vitest
npm run test:watch
npm run seed          # stub accounts + fake events for UI dev without OAuth
```

## Architecture

See `docs/superpowers/specs/2026-04-10-calsync-design.md` for the full design and `docs/superpowers/plans/2026-04-10-calsync.md` for the implementation plan.

Local phase uses SQLite; production will swap to Postgres via Drizzle by changing `DATABASE_URL`. The domain layer (`lib/sync/sync-user.ts`) is a pure function callable from a cron without refactor.
