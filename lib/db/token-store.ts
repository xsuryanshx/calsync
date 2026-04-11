import { eq, and, sql } from "drizzle-orm";
import { getDb } from "./client";
import { accounts, type Account } from "./schema";
import { encryptToken, decryptToken } from "@/lib/crypto/tokens";

export const DEFAULT_COLORS = ["#3b82f6", "#10b981"] as const;

export type UpsertAccountInput = {
  userId: number;
  googleEmail: string;
  refreshToken: string;
  accessToken: string | null;
  accessTokenExpiresAt: Date | null;
  displayColor?: string;
};

export async function upsertAccount(input: UpsertAccountInput): Promise<Account> {
  const db = getDb();
  const encryptedRefreshToken = encryptToken(input.refreshToken);
  const now = new Date();

  const existing = db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, input.userId), eq(accounts.googleEmail, input.googleEmail)))
    .all();

  if (existing.length > 0) {
    db.update(accounts)
      .set({
        encryptedRefreshToken,
        accessToken: input.accessToken,
        accessTokenExpiresAt: input.accessTokenExpiresAt,
        updatedAt: now,
      })
      .where(eq(accounts.id, existing[0].id))
      .run();
    return db.select().from(accounts).where(eq(accounts.id, existing[0].id)).all()[0];
  }

  let color = input.displayColor;
  if (!color) {
    const countRow = db
      .select({ c: sql<number>`count(*)` })
      .from(accounts)
      .where(eq(accounts.userId, input.userId))
      .all();
    const count = Number(countRow[0]?.c ?? 0);
    color = DEFAULT_COLORS[count % DEFAULT_COLORS.length];
  }

  const inserted = db
    .insert(accounts)
    .values({
      userId: input.userId,
      googleEmail: input.googleEmail,
      encryptedRefreshToken,
      accessToken: input.accessToken,
      accessTokenExpiresAt: input.accessTokenExpiresAt,
      displayColor: color,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .all();

  return inserted[0];
}

export async function listAccountsForUser(userId: number): Promise<Account[]> {
  const db = getDb();
  return db.select().from(accounts).where(eq(accounts.userId, userId)).all();
}

export async function getAccountById(id: number): Promise<Account | null> {
  const db = getDb();
  const rows = db.select().from(accounts).where(eq(accounts.id, id)).all();
  return rows[0] ?? null;
}

export async function getDecryptedRefreshToken(accountId: number): Promise<string> {
  const row = await getAccountById(accountId);
  if (!row) throw new Error(`account ${accountId} not found`);
  return decryptToken(row.encryptedRefreshToken);
}

export async function updateAccessToken(
  accountId: number,
  accessToken: string,
  expiresAt: Date,
): Promise<void> {
  const db = getDb();
  db.update(accounts)
    .set({ accessToken, accessTokenExpiresAt: expiresAt, updatedAt: new Date() })
    .where(eq(accounts.id, accountId))
    .run();
}
