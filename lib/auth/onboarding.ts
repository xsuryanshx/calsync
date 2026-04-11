import { clearGoogleLoginTokensForUser, getGoogleLoginAccountForUser } from "@/lib/db/auth-store";
import { listAccountsForUser, upsertAccount } from "@/lib/db/token-store";
import { logger } from "@/lib/logger";
import { syncUserCalendars } from "@/lib/sync/sync-user";
import { withUserSyncLock } from "@/lib/sync/sync-guard";

export async function ensurePrimaryCalendarConnectionForUser(
  userId: string,
): Promise<void> {
  const existing = await listAccountsForUser(userId);
  if (existing.length > 0) return;

  const loginAccount = await getGoogleLoginAccountForUser(userId);
  if (!loginAccount?.providerAccountId || !loginAccount.userEmail) {
    return;
  }

  if (!loginAccount.refreshToken) {
    logger.warn(
      { userId, providerAccountId: loginAccount.providerAccountId },
      "google login account missing refresh token during onboarding",
    );
    return;
  }

  const connection = await upsertAccount({
    userId,
    googleSub: loginAccount.providerAccountId,
    googleEmail: loginAccount.userEmail,
    refreshToken: loginAccount.refreshToken,
    accessToken: loginAccount.accessToken,
    accessTokenExpiresAt: loginAccount.expiresAt,
    status: "active",
  });

  try {
    await withUserSyncLock(userId, async () => {
      await syncUserCalendars(userId, { accountIds: [connection.id] });
    });
    await clearGoogleLoginTokensForUser(userId, loginAccount.providerAccountId);
  } catch (error) {
    logger.error({ userId, err: String(error) }, "initial calendar sync failed");
  }
}
