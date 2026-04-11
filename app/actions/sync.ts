"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/session";
import {
  enforceManualSyncRateLimit,
  withUserSyncLock,
} from "@/lib/sync/sync-guard";
import { syncUserCalendars, type SyncResult } from "@/lib/sync/sync-user";

export async function syncCalendarsAction(): Promise<SyncResult> {
  const userId = await requireUserId();
  await enforceManualSyncRateLimit(userId);
  const result = await withUserSyncLock(userId, () => syncUserCalendars(userId));
  revalidatePath("/week");
  revalidatePath("/settings");
  return result;
}
