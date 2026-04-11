# calsync

Private multi-user calendar dashboard for Google Calendar. Users sign in with Google, their first Google account is auto-linked on onboarding, they can add more Google accounts later, and they get a unified read-only week view with manual sync.

## Stack

- Next.js 16 App Router
- Auth.js v5 with Google
- Drizzle ORM
- Postgres for app/auth/event storage
- Upstash Redis for sync locking and rate limiting
- Google Calendar API (`calendar.readonly`)

## Local setup

### 1. Google Cloud OAuth client

1. Go to https://console.cloud.google.com/ and create a project.
2. Enable the Google Calendar API.
3. Configure the OAuth consent screen.
4. Create an OAuth 2.0 Client ID for a Web application.
5. Add these redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000/api/google/callback`

### 2. Environment variables

```bash
cp .env.local.example .env.local

openssl rand -base64 32   # NEXTAUTH_SECRET
openssl rand -base64 32   # ENCRYPTION_KEY
```

Fill in `.env.local` with:

- Google client ID and secret
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL=http://localhost:3000`
- a Postgres `DATABASE_URL`
- optional Upstash Redis credentials for local sync locking

Important: the old `file:./calsync.db` SQLite URL will not work on this branch anymore.

### 3. Install dependencies

```bash
npm install
```

### 4. Generate the migration

```bash
npm run db:generate
npm run db:migrate
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, and the sign-in Google account will be auto-linked and synced. Add more Google accounts from `/settings`.

## Vercel deployment

1. Create a Vercel project for this repo.
2. Attach a Postgres database and copy its `DATABASE_URL`.
3. Attach Upstash Redis and copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Add all required env vars in Vercel.
5. In Google Cloud, add production redirect URIs:
   - `https://YOUR_DOMAIN/api/auth/callback/google`
   - `https://YOUR_DOMAIN/api/google/callback`

The build uses `next build --webpack` to avoid a Turbopack CSS worker issue we hit locally during production verification.

## Development checks

```bash
npm test
npm run lint
npm run build
```

## Core behavior

- `/` is public and starts Google sign-in.
- `/week` and `/settings` require an authenticated app session.
- The sign-in Google account is auto-provisioned as the first linked calendar connection.
- Additional Google accounts are linked through `/api/google/link`.
- A successful new connection triggers an immediate first sync.
- Later syncs are manual through the existing Sync button.
- All event reads are scoped to the authenticated user.
