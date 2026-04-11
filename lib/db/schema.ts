import { sqliteTable, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const accounts = sqliteTable(
  "accounts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    googleEmail: text("google_email").notNull(),
    encryptedRefreshToken: text("encrypted_refresh_token").notNull(),
    accessToken: text("access_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    displayColor: text("display_color").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [uniqueIndex("accounts_user_email_uniq").on(t.userId, t.googleEmail)],
);

export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    googleEventId: text("google_event_id").notNull(),
    icalUid: text("ical_uid"),
    title: text("title"),
    description: text("description"),
    location: text("location"),
    startTs: integer("start_ts", { mode: "timestamp" }).notNull(),
    endTs: integer("end_ts", { mode: "timestamp" }).notNull(),
    isAllDay: integer("is_all_day", { mode: "boolean" }).notNull().default(false),
    tz: text("tz"),
    status: text("status"),
    responseStatus: text("response_status"),
    htmlLink: text("html_link"),
    hangoutLink: text("hangout_link"),
    rawJson: text("raw_json"),
    syncedAt: integer("synced_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [uniqueIndex("events_account_event_uniq").on(t.accountId, t.googleEventId)],
);

export const syncState = sqliteTable("sync_state", {
  accountId: integer("account_id")
    .primaryKey()
    .references(() => accounts.id),
  lastSyncToken: text("last_sync_token"),
  lastFullSyncAt: integer("last_full_sync_at", { mode: "timestamp" }),
});

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
