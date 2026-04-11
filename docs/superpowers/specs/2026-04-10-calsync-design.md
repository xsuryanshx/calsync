# calsync — Design Spec

**Date:** 2026-04-10
**Status:** Approved for implementation
**Owner:** Suryansh Singh Rawat

## 1. Problem

Two actively-used Google Calendar accounts, no unified view. User is tired of switching between two Google Calendar tabs to find meetings and see "where am I supposed to be next." Needs a single-pane view of both calendars.

## 2. Goals and Non-Goals

### Goals (local phase, MVP)
- Unified read-only week view of events from two Google Calendar accounts.
- Manual "Sync" button with a shimmer state while syncing.
- Event popover with "Open in Google Calendar" jump-out.
- Local-only deployment on `localhost:3000`.
- Architected so production deploy is a config change, not a rewrite.

### Non-Goals (explicitly out of scope for MVP)
- Bidirectional sync / busy-block mirroring between calendars.
- Multi-user, real app-level auth, billing.
- Mobile/native apps.
- Calendar navigation beyond "this week + next week."
- Multiple calendars per Google account (primary only).
- Public cloud deployment (deferred).
- Push notifications / Google webhook-based sync.
- Automatic background sync (domain layer is ready for it; not wired up).

## 3. Product Decisions (locked)

| Decision | Value |
|---|---|
| Form factor | Next.js web app, opened in browser |
| Runtime | Local-only (`localhost:3000`) |
| Sync semantics | Read-only aggregation (no writes back to Google) |
| Sync cadence | Manual button only; shimmer feedback during fetch |
| Primary view | Week grid (7 columns × hours), Google-Calendar-style |
| Time window | Current week + next week; no past, no further future |
| Week navigation | Toggle/arrow between "this week" and "next week" only |
| Source calendars | Primary calendar of each Google account only |
| Event filter | Hide events where `responseStatus == 'declined'` |
| All-day events | Shown as strip above time grid per day |
| Account labels | Raw email addresses (no rename) |
| Account colors | Fixed: Account 1 = `#3b82f6` (blue), Account 2 = `#10b981` (green) |
| Event click | Popover with title/time/location/attendees + "Open in Google Calendar" button |
| Timezone | Mac's system timezone (client-side `Intl.DateTimeFormat().resolvedOptions().timeZone`) |
| App-level auth | None in local phase (`localhost` is trusted) |
| Tech stack | Next.js 15 (App Router), TypeScript strict, React 19 |
| ORM | Drizzle (SQLite now, Postgres later) |
| OAuth | Auth.js v5 (NextAuth), Google provider, calendar.readonly scope |
| Token storage | Encrypted at rest (AES-256-GCM via node `crypto`) |
| Logger | `pino` structured JSON logs |
| Config | `zod`-validated env loader in `lib/config.ts` |

## 4. Architecture

Single Next.js process containing four internal layers:

```
Browser (localhost:3000)
    │  HTTP + RSC
    ▼
┌───────────────────────────────────────────┐
│ Next.js App (one process)                 │
│                                           │
│  UI layer · /app, /components             │
│    WeekGrid, SyncButton, EventPopover     │
│                                           │
│  Server layer · /app/api, server actions  │
│    GET /api/events, POST sync (action)    │
│    /api/auth/[...nextauth] (Auth.js)      │
│                                           │
│  Domain layer · /lib                      │
│    syncUserCalendars(userId)              │
│    GoogleCalendarClient                   │
│    tokenCrypto, mergeEvents               │
│                                           │
│  Storage layer · /lib/db                  │
│    TokenStore, EventStore (interfaces)    │
│    SqliteTokenStore, SqliteEventStore     │
└───────────────────────────────────────────┘
    │                                │
    ▼                                ▼
┌──────────────┐             ┌─────────────────────┐
│ SQLite file  │             │ Google Calendar API │
│ calsync.db   │             │ (2 OAuth accounts)  │
└──────────────┘             └─────────────────────┘
```

**Productionization seams** (no code changes required; swap via env/config):
- SQLite → Postgres (Drizzle re-targets; same schema).
- Hardcoded `userId = 1` → real Auth.js session user.
- Button-triggered sync → additional cron/scheduled function calling `syncUserCalendars(userId)` unchanged.
- Token encryption key → rotate via `ENCRYPTION_KEY` env var.

## 5. Data Model

Defined once in Drizzle (`lib/db/schema.ts`) so SQLite ↔ Postgres swap is a driver change.

```ts
users (
  id           INTEGER PK AUTOINCREMENT,
  email        TEXT,
  created_at   TIMESTAMP DEFAULT now
)

accounts (
  id                         INTEGER PK AUTOINCREMENT,
  user_id                    INTEGER FK → users.id,
  google_email               TEXT NOT NULL,
  encrypted_refresh_token    TEXT NOT NULL,
  access_token               TEXT,
  access_token_expires_at    TIMESTAMP,
  display_color              TEXT NOT NULL,          -- hex
  created_at                 TIMESTAMP DEFAULT now,
  updated_at                 TIMESTAMP,
  UNIQUE (user_id, google_email)
)

events (
  id                INTEGER PK AUTOINCREMENT,
  user_id           INTEGER FK → users.id,
  account_id        INTEGER FK → accounts.id,
  google_event_id   TEXT NOT NULL,
  ical_uid          TEXT,
  title             TEXT,
  description       TEXT,
  location          TEXT,
  start_ts          TIMESTAMP NOT NULL,              -- UTC
  end_ts            TIMESTAMP NOT NULL,              -- UTC
  is_all_day        BOOLEAN NOT NULL DEFAULT false,
  tz                TEXT,                            -- event's original tz
  status            TEXT,                            -- confirmed|tentative|cancelled
  response_status   TEXT,                            -- accepted|declined|needsAction|tentative
  html_link         TEXT,
  hangout_link      TEXT,
  raw_json          TEXT,                            -- full Google payload for popover
  synced_at         TIMESTAMP NOT NULL,
  UNIQUE (account_id, google_event_id)
)

sync_state (
  account_id          INTEGER PK FK → accounts.id,
  last_sync_token     TEXT,                          -- reserved for incremental sync
  last_full_sync_at   TIMESTAMP
)
```

**Local phase seed:** a boot-time migration hook (`lib/db/client.ts` initializer) ensures exactly one `users` row with `id=1` exists, inserting it on first run. All other tables reference it via `user_id=1` hardcoded in the domain layer. Multi-user migration is a no-op later because the column already exists.

**Token storage nuance:** only `encrypted_refresh_token` is encrypted at rest. `access_token` is short-lived (1 hour) and stored as plaintext; on expiry, `GoogleCalendarClient` refreshes it using the decrypted refresh token and writes the new access token back.

**`sync_state` table:** reserved for future incremental sync via Google's `syncToken`. Not written or read in MVP — table exists so the migration doesn't need to change later.

**Declined filter:** applied at *read* time (`WHERE response_status != 'declined'`), not write time — keeps raw data intact and lets us revisit filter rules without re-syncing.

## 6. OAuth Flow

Auth.js v5 with the Google provider, used in a non-standard "link multiple accounts to the same local user" pattern:

1. User visits `/settings` and clicks "Connect Google Account."
2. Redirect to Google OAuth consent with:
   - scope: `openid email https://www.googleapis.com/auth/calendar.readonly`
   - `access_type=offline`
   - `prompt=consent` (forces refresh token issuance even on re-connect)
3. Callback `/api/auth/callback/google` receives tokens.
4. Callback handler writes/updates an `accounts` row keyed by `(user_id=1, google_email)`:
   - `encrypted_refresh_token = tokenCrypto.encrypt(refresh_token)`
   - `access_token`, `access_token_expires_at`
   - `display_color` = blue if first account, green if second
5. Redirect back to `/settings` showing both connected accounts.

**Reconnect flow:** same callback path. Existing row upserted.

**Environment variables** required:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET` (Auth.js session signing)
- `NEXTAUTH_URL` (`http://localhost:3000`)
- `ENCRYPTION_KEY` (32-byte base64, for token crypto)
- `DATABASE_URL` (`file:./calsync.db` locally)

User must complete one-time Google Cloud setup: create OAuth 2.0 Client ID (Web application), add `http://localhost:3000/api/auth/callback/google` as redirect URI, enable Google Calendar API, add both Gmail addresses as test users while app is in Testing mode.

## 7. Sync Flow

Triggered only by the Sync button. Entry point is a React Server Action.

```
User clicks SyncButton (client)
  ↓
syncCalendarsAction() (server action)
  ↓
syncUserCalendars(userId = 1):
  accounts = tokenStore.listByUser(userId)
  results = await Promise.all(accounts.map(async account => {
    client = new GoogleCalendarClient(account)      // handles access-token refresh
    window = { timeMin: startOfThisWeek, timeMax: endOfNextWeek }
    raw = await client.listEvents({
      ...window,
      singleEvents: true,                           // expand recurring
      showDeleted: false,
      maxResults: 2500,
    })
    await eventStore.replaceWindow(account.id, window, raw)
    return { accountId: account.id, eventCount: raw.length, status: 'ok' }
  }))
  return { syncedAt: now, perAccount: results }
  ↓
revalidatePath('/week')
  ↓
UI re-renders week grid from EventStore
```

**`eventStore.replaceWindow` contract:** inside a transaction, delete all events for this `account_id` whose `start_ts` is inside the window, then upsert the fresh set. Guarantees cancellations are reflected.

**Shimmer:** `SyncButton` sets a local `isPending` state using `useTransition`. Shimmer runs for the duration of the server action promise, regardless of how fast the actual network call is.

## 8. UI Structure

```
/app
  layout.tsx                    — shell, providers, error boundary
  page.tsx                      — redirects to /settings if 0 accounts, else /week
  /week/page.tsx                — server component, loads events from EventStore
  /settings/page.tsx            — server component, list accounts + connect button
  /api/events/route.ts          — GET /api/events?from&to — reads EventStore
  /api/auth/[...nextauth]/route.ts — Auth.js handler
  /api/sync/route.ts            — optional POST endpoint (mirrors server action for future cron reuse)
  error.tsx                     — root error boundary
  not-found.tsx                 — 404
/components
  WeekGrid.tsx                  — client component, 7-col × hour rows
  DayColumn.tsx                 — single day column with events positioned absolutely
  EventBlock.tsx                — positioned event card, colored by account
  EventPopover.tsx              — details + "Open in Google Calendar"
  AllDayStrip.tsx               — strip above time grid for all-day events
  SyncButton.tsx                — triggers server action, shows shimmer
  AccountBadge.tsx              — colored dot + email, error state if reauth needed
  WeekSwitcher.tsx              — "This week" / "Next week" toggle
  ReconnectBanner.tsx           — shown when a token is revoked
/lib
  config.ts                     — zod env loader
  logger.ts                     — pino instance
  db/
    schema.ts                   — Drizzle tables
    client.ts                   — drizzle + better-sqlite3 client, migration on boot
    token-store.ts              — TokenStore interface + SqliteTokenStore
    event-store.ts              — EventStore interface + SqliteEventStore
  google/
    client.ts                   — GoogleCalendarClient (refresh handling, list events)
    merge.ts                    — filter declined, sort, dedup helpers
    map.ts                      — Google event → domain Event mapper
  crypto/
    tokens.ts                   — AES-256-GCM encrypt/decrypt
  sync/
    sync-user.ts                — syncUserCalendars orchestrator
  auth/
    config.ts                   — Auth.js config (Google provider, callbacks)
/scripts
  seed-test-data.ts             — stuff fake events into SQLite for UI dev without OAuth
/drizzle                         — generated migration files
```

**Week grid rendering:** events are positioned absolutely inside `DayColumn` based on `start_ts` and `end_ts`. Overlapping events split horizontally (simple 2-column overlap handling for MVP; 3+ overlap is a nice-to-have). Account color = left border + semi-transparent fill.

**All-day events:** rendered in `AllDayStrip` above the hour grid, one pill per event per day it spans.

## 9. Error Handling

| Scenario | Handling |
|---|---|
| Refresh token revoked / invalid_grant | `GoogleCalendarClient` throws typed `ReauthRequired(accountId)`; sync marks that account's result `{status: 'reauth_required'}`; `AccountBadge` shows "Reconnect" CTA; `<ReconnectBanner>` renders at top of week view listing affected accounts; cache untouched |
| Google API 5xx / transient | Retry once with 1s backoff; if still failing, `{status: 'error', reason}` returned; cache untouched; toast in UI |
| Google API 429 | Exponential backoff up to 3 attempts (1s → 2s → 4s) |
| Partial sync (one account OK, one fails) | Per-account status reported; successful account's events get replaced; failed account keeps stale cache + warning badge |
| DB write error | Logged via pino; surfaced as sync failure; raw exception bubbles to `error.tsx` if unrecoverable |
| Missing env vars | `lib/config.ts` zod validation throws at boot with clear message |
| 0 accounts connected | `/` redirects to `/settings`; Sync button disabled |
| Network offline | Fetch fails fast; UI shows "offline" state; cache still readable |

Root-level `app/error.tsx` catches anything else and shows a friendly message with the error digest.

## 10. Testing Strategy

**Scope:** minimal but meaningful. Not full coverage; targeted at the things most likely to break silently.

| Layer | Tool | What |
|---|---|---|
| Unit | Vitest | `crypto/tokens.ts` round-trip; `google/merge.ts` filter/dedup/sort; `google/map.ts` Google-event → domain mapping edge cases (all-day, timezones, cancelled) |
| Unit | Vitest + mocked `googleapis` | `GoogleCalendarClient` access-token refresh flow; revoked-token path |
| Integration | Vitest + in-memory SQLite + `nock` | `syncUserCalendars` end-to-end: two mocked accounts, one happy, one returning 401 → verify partial result + reauth flag |
| Integration | Vitest + in-memory SQLite | `EventStore.replaceWindow` idempotency + cancellation handling |
| Manual | n/a | `scripts/seed-test-data.ts` populates DB for UI dev without real OAuth |
| E2E | — | Skipped for local phase |

## 11. Open Questions

None at spec time. All product and architectural decisions are locked.

## 12. Future Work (explicitly deferred)

- Deploy to Vercel / Fly / Railway; migrate SQLite → Postgres via Drizzle env switch.
- Add Auth.js session-based app-level auth (Google SSO) layered on top.
- Background sync via cron / scheduled function calling `syncUserCalendars`.
- Per-calendar selection UI (toggle which calendars per account to include).
- Configurable per-calendar filters (hide all-day, etc).
- Color customization per account.
- Google Calendar push notifications for real-time updates (requires public URL).
- Bidirectional busy-block mirroring between the two calendars.
- Month and day views.
- Wider time window with infinite scroll.
- Mobile-optimized layout.
