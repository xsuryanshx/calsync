import { listAccountsForUser, getDecryptedRefreshToken } from "@/lib/db/token-store";
import { replaceWindow } from "@/lib/db/event-store";
import {
  GoogleCalendarClient,
  ReauthRequired,
  SyncFailed,
} from "@/lib/google/client";
import { mapGoogleEvent } from "@/lib/google/map";
import { logger } from "@/lib/logger";

export type PerAccountResult =
  | { accountId: number; googleEmail: string; status: "ok"; eventCount: number }
  | { accountId: number; googleEmail: string; status: "reauth_required" }
  | { accountId: number; googleEmail: string; status: "error"; reason: string };

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
  userId: number,
  window?: { start: Date; end: Date },
): Promise<SyncResult> {
  const accounts = await listAccountsForUser(userId);
  const syncWindow = window ?? defaultWindow();

  const perAccount = await Promise.all(
    accounts.map(async (a): Promise<PerAccountResult> => {
      try {
        const refreshToken = await getDecryptedRefreshToken(a.id);
        const client = new GoogleCalendarClient({
          accountId: a.id,
          refreshToken,
          accessToken: a.accessToken ?? null,
          accessTokenExpiresAt: a.accessTokenExpiresAt ?? null,
        });
        const raw = await client.listEvents({
          timeMin: syncWindow.start,
          timeMax: syncWindow.end,
        });
        const mapped = raw.map(mapGoogleEvent);
        await replaceWindow(a.id, userId, syncWindow, mapped);
        return {
          accountId: a.id,
          googleEmail: a.googleEmail,
          status: "ok",
          eventCount: mapped.length,
        };
      } catch (err) {
        if (err instanceof ReauthRequired) {
          logger.warn({ accountId: a.id }, "reauth required");
          return { accountId: a.id, googleEmail: a.googleEmail, status: "reauth_required" };
        }
        logger.error({ accountId: a.id, err: String(err) }, "sync failed");
        return {
          accountId: a.id,
          googleEmail: a.googleEmail,
          status: "error",
          reason: err instanceof SyncFailed ? err.reason : String(err),
        };
      }
    }),
  );

  return { syncedAt: new Date(), perAccount };
}
