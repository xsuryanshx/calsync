import { and, eq } from "drizzle-orm";
import { getDb } from "./client";
import { authAccounts, users } from "./schema";

export type GoogleLoginAccount = {
  userId: string;
  userEmail: string | null;
  providerAccountId: string;
  refreshToken: string | null;
  accessToken: string | null;
  expiresAt: Date | null;
};

export async function getGoogleLoginAccountForUser(
  userId: string,
): Promise<GoogleLoginAccount | null> {
  const db = getDb();
  const [row] = await db
    .select({
      userId: authAccounts.userId,
      userEmail: users.email,
      providerAccountId: authAccounts.providerAccountId,
      refreshToken: authAccounts.refresh_token,
      accessToken: authAccounts.access_token,
      expiresAt: authAccounts.expires_at,
    })
    .from(authAccounts)
    .innerJoin(users, eq(authAccounts.userId, users.id))
    .where(
      and(eq(authAccounts.userId, userId), eq(authAccounts.provider, "google")),
    );

  if (!row) return null;

  return {
    userId: row.userId,
    userEmail: row.userEmail,
    providerAccountId: row.providerAccountId,
    refreshToken: row.refreshToken ?? null,
    accessToken: row.accessToken ?? null,
    expiresAt:
      typeof row.expiresAt === "number" ? new Date(row.expiresAt * 1000) : null,
  };
}

export async function clearGoogleLoginTokensForUser(
  userId: string,
  providerAccountId: string,
): Promise<void> {
  const db = getDb();
  await db
    .update(authAccounts)
    .set({
      refresh_token: null,
      access_token: null,
      expires_at: null,
      token_type: null,
      scope: null,
      id_token: null,
      session_state: null,
    })
    .where(
      and(
        eq(authAccounts.userId, userId),
        eq(authAccounts.provider, "google"),
        eq(authAccounts.providerAccountId, providerAccountId),
      ),
    );
}
