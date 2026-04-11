import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "./client";
import { calendarConnections, type CalendarConnection } from "./schema";
import { decryptToken, encryptToken } from "@/lib/crypto/tokens";

export const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
] as const;

export type ConnectionStatus = "active" | "reauth_required";

export type UpsertAccountInput = {
  userId: string;
  googleSub: string;
  googleEmail: string;
  refreshToken: string | null;
  accessToken: string | null;
  accessTokenExpiresAt: Date | null;
  displayColor?: string;
  status?: ConnectionStatus;
};

export async function upsertAccount(
  input: UpsertAccountInput,
): Promise<CalendarConnection> {
  const db = getDb();
  const now = new Date();

  const existing = await db
    .select()
    .from(calendarConnections)
    .where(
      and(
        eq(calendarConnections.userId, input.userId),
        eq(calendarConnections.googleSub, input.googleSub),
      ),
    );

  if (existing.length > 0) {
    if (!input.refreshToken && !existing[0].encryptedRefreshToken) {
      throw new Error("refresh token required for new calendar connection");
    }

    const encryptedRefreshToken = input.refreshToken
      ? encryptToken(input.refreshToken)
      : existing[0].encryptedRefreshToken;

    const [updated] = await db
      .update(calendarConnections)
      .set({
        googleEmail: input.googleEmail,
        encryptedRefreshToken,
        accessToken: input.accessToken,
        accessTokenExpiresAt: input.accessTokenExpiresAt,
        status: input.status ?? "active",
        updatedAt: now,
      })
      .where(eq(calendarConnections.id, existing[0].id))
      .returning();

    return updated;
  }

  if (!input.refreshToken) {
    throw new Error("refresh token required for new calendar connection");
  }

  let color = input.displayColor;
  if (!color) {
    const [countRow] = await db
      .select({ c: sql<number>`count(*)` })
      .from(calendarConnections)
      .where(eq(calendarConnections.userId, input.userId));
    const count = Number(countRow?.c ?? 0);
    color = DEFAULT_COLORS[count % DEFAULT_COLORS.length];
  }

  const [inserted] = await db
    .insert(calendarConnections)
    .values({
      userId: input.userId,
      googleSub: input.googleSub,
      googleEmail: input.googleEmail,
      encryptedRefreshToken: encryptToken(input.refreshToken),
      accessToken: input.accessToken,
      accessTokenExpiresAt: input.accessTokenExpiresAt,
      displayColor: color,
      status: input.status ?? "active",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return inserted;
}

export async function listAccountsForUser(
  userId: string,
): Promise<CalendarConnection[]> {
  const db = getDb();
  return db
    .select()
    .from(calendarConnections)
    .where(eq(calendarConnections.userId, userId))
    .orderBy(asc(calendarConnections.createdAt));
}

export async function getAccountById(id: string): Promise<CalendarConnection | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(calendarConnections)
    .where(eq(calendarConnections.id, id));
  return row ?? null;
}

export async function getAccountByGoogleSub(
  userId: string,
  googleSub: string,
): Promise<CalendarConnection | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(calendarConnections)
    .where(
      and(
        eq(calendarConnections.userId, userId),
        eq(calendarConnections.googleSub, googleSub),
      ),
    );
  return row ?? null;
}

export async function getDecryptedRefreshToken(accountId: string): Promise<string> {
  const row = await getAccountById(accountId);
  if (!row) throw new Error(`calendar connection ${accountId} not found`);
  return decryptToken(row.encryptedRefreshToken);
}

export async function updateAccessToken(
  accountId: string,
  accessToken: string,
  expiresAt: Date,
): Promise<void> {
  const db = getDb();
  await db
    .update(calendarConnections)
    .set({
      accessToken,
      accessTokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(calendarConnections.id, accountId));
}

export async function markAccountStatus(
  accountId: string,
  status: ConnectionStatus,
): Promise<void> {
  const db = getDb();
  await db
    .update(calendarConnections)
    .set({ status, updatedAt: new Date() })
    .where(eq(calendarConnections.id, accountId));
}

export async function deleteAccountForUser(
  userId: string,
  accountId: string,
): Promise<boolean> {
  const db = getDb();
  const deleted = await db
    .delete(calendarConnections)
    .where(
      and(
        eq(calendarConnections.userId, userId),
        eq(calendarConnections.id, accountId),
      ),
    )
    .returning({ id: calendarConnections.id });

  return deleted.length > 0;
}
