import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { config } from "@/lib/config";
import { exchangeGoogleCalendarCode } from "@/lib/google/oauth";
import { logger } from "@/lib/logger";
import { upsertAccount } from "@/lib/db/token-store";
import { getCurrentUserId } from "@/lib/auth/session";
import { syncUserCalendars } from "@/lib/sync/sync-user";
import { withUserSyncLock } from "@/lib/sync/sync-guard";

const STATE_COOKIE = "calsync_google_link_state";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const redirectToSettings = new URL("/settings", config.nextAuthUrl);
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || state !== cookieState) {
    redirectToSettings.searchParams.set("error", "invalid_link_state");
    const response = NextResponse.redirect(redirectToSettings);
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  try {
    const { tokens, profile } = await exchangeGoogleCalendarCode(code);
    if (!profile.sub || !profile.email) {
      throw new Error("google callback missing subject or email");
    }

    const connection = await upsertAccount({
      userId,
      googleSub: profile.sub,
      googleEmail: profile.email,
      refreshToken: tokens.refresh_token ?? null,
      accessToken: tokens.access_token ?? null,
      accessTokenExpiresAt:
        typeof tokens.expiry_date === "number"
          ? new Date(tokens.expiry_date)
          : null,
      status: "active",
    });

    await withUserSyncLock(userId, async () => {
      await syncUserCalendars(userId, { accountIds: [connection.id] });
    });

    revalidatePath("/week");
    revalidatePath("/settings");
    redirectToSettings.searchParams.set("connected", "1");
  } catch (error) {
    logger.error({ userId, err: String(error) }, "google calendar link failed");
    redirectToSettings.searchParams.set("error", "link_failed");
  }

  const response = NextResponse.redirect(redirectToSettings);
  response.cookies.delete(STATE_COOKIE);
  return response;
}
