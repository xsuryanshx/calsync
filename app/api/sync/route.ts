import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/session";
import { syncUserCalendars } from "@/lib/sync/sync-user";
import {
  SyncLockedError,
  SyncRateLimitedError,
  enforceManualSyncRateLimit,
  withUserSyncLock,
} from "@/lib/sync/sync-guard";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    await enforceManualSyncRateLimit(userId);
    const result = await withUserSyncLock(userId, () => syncUserCalendars(userId));
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SyncRateLimitedError) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    if (err instanceof SyncLockedError) {
      return NextResponse.json({ error: "sync_in_progress" }, { status: 409 });
    }
    logger.error({ err: String(err) }, "/api/sync failed");
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
