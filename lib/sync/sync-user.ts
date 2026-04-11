import {
  getDecryptedRefreshToken,
  listAccountsForUser,
  markAccountStatus,
  updateAccessToken,
} from "@/lib/db/token-store";
import { replaceWindow } from "@/lib/db/event-store";
import {
  GoogleCalendarClient,
  ReauthRequired,
  SyncFailed,
} from "@/lib/google/client";
import { mapGoogleEvent } from "@/lib/google/map";
import { logger } from "@/lib/logger";
import { withAccountSyncLock } from "./sync-guard";

export type PerAccountResult =
  | { accountId: string; googleEmail: string; status: "ok"; eventCount: number }
  | { accountId: string; googleEmail: string; status: "reauth_required" }
  | { accountId: string; googleEmail: string; status: "error"; reason: string };

export type SyncResult = {
  syncedAt: Date;
  perAccount: PerAccountResult[];
};

export function defaultWindow(now = new Date()): { start: Date; end: Date } {
  const d = new Date(now);
  const dayOfWeek = d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - dayOfWeek);
  const end = new Date(d);
  end.setDate(end.getDate() + 14);
  return { start: d, end };
}

export async function syncUserCalendars(
  userId: string,
  options?: {
    window?: { start: Date; end: Date };
    accountIds?: string[];
  },
): Promise<SyncResult> {
  const accounts = await listAccountsForUser(userId);
  const targetIds = options?.accountIds;
  const accountsToSync = targetIds
    ? accounts.filter((account) => targetIds.includes(account.id))
    : accounts;
  const syncWindow = options?.window ?? defaultWindow();

  const perAccount = await Promise.all(
    accountsToSync.map(async (account): Promise<PerAccountResult> => {
      try {
        return await withAccountSyncLock(account.id, async () => {
          const refreshToken = await getDecryptedRefreshToken(account.id);
          const client = new GoogleCalendarClient({
            accountId: account.id,
            refreshToken,
            accessToken: account.accessToken ?? null,
            accessTokenExpiresAt: account.accessTokenExpiresAt ?? null,
          });
          const raw = await client.listEvents({
            timeMin: syncWindow.start,
            timeMax: syncWindow.end,
          });
          const mapped = raw.items.map(mapGoogleEvent);
          await replaceWindow(account.id, userId, syncWindow, mapped);

          if (raw.accessToken && raw.accessTokenExpiresAt) {
            await updateAccessToken(
              account.id,
              raw.accessToken,
              raw.accessTokenExpiresAt,
            );
          }

          await markAccountStatus(account.id, "active");
          return {
            accountId: account.id,
            googleEmail: account.googleEmail,
            status: "ok",
            eventCount: mapped.length,
          };
        });
      } catch (err) {
        if (err instanceof ReauthRequired) {
          logger.warn({ accountId: account.id }, "reauth required");
          await markAccountStatus(account.id, "reauth_required");
          return {
            accountId: account.id,
            googleEmail: account.googleEmail,
            status: "reauth_required",
          };
        }

        logger.error({ accountId: account.id, err: String(err) }, "sync failed");
        return {
          accountId: account.id,
          googleEmail: account.googleEmail,
          status: "error",
          reason: err instanceof SyncFailed ? err.reason : String(err),
        };
      }
    }),
  );

  return { syncedAt: new Date(), perAccount };
}
