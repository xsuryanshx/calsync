import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }),
  image: text("image"),
});

export const authAccounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    compositePk: primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => ({
    compositePk: primaryKey({
      columns: [table.identifier, table.token],
    }),
  }),
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (table) => ({
    compositePk: primaryKey({
      columns: [table.userId, table.credentialID],
    }),
  }),
);

export const calendarConnections = pgTable(
  "calendar_connection",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    googleSub: text("google_sub").notNull(),
    googleEmail: text("google_email").notNull(),
    encryptedRefreshToken: text("encrypted_refresh_token").notNull(),
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    displayColor: text("display_color").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userGoogleSubUnique: uniqueIndex("calendar_connection_user_google_sub_uniq").on(
      table.userId,
      table.googleSub,
    ),
    userCreatedAtIdx: index("calendar_connection_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
  }),
);

export const events = pgTable(
  "calendar_event",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => calendarConnections.id, { onDelete: "cascade" }),
    googleEventId: text("google_event_id").notNull(),
    icalUid: text("ical_uid"),
    title: text("title"),
    description: text("description"),
    location: text("location"),
    startTs: timestamp("start_ts", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    endTs: timestamp("end_ts", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    isAllDay: boolean("is_all_day").notNull().default(false),
    tz: text("tz"),
    status: text("status"),
    responseStatus: text("response_status"),
    htmlLink: text("html_link"),
    hangoutLink: text("hangout_link"),
    rawJson: text("raw_json"),
    syncedAt: timestamp("synced_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (table) => ({
    accountEventUnique: uniqueIndex("calendar_event_account_google_event_uniq").on(
      table.accountId,
      table.googleEventId,
    ),
    userStartIdx: index("calendar_event_user_start_idx").on(
      table.userId,
      table.startTs,
    ),
  }),
);

export const syncState = pgTable("sync_state", {
  accountId: uuid("account_id")
    .primaryKey()
    .references(() => calendarConnections.id, { onDelete: "cascade" }),
  lastSyncToken: text("last_sync_token"),
  lastFullSyncAt: timestamp("last_full_sync_at", {
    mode: "date",
    withTimezone: true,
  }),
});

export type User = typeof users.$inferSelect;
export type AuthAccount = typeof authAccounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type CalendarConnection = typeof calendarConnections.$inferSelect;
export type Event = typeof events.$inferSelect;
