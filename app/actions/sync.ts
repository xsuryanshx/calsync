"use server";

import { revalidatePath } from "next/cache";
import { syncUserCalendars, type SyncResult } from "@/lib/sync/sync-user";

export async function syncCalendarsAction(): Promise<SyncResult> {
  const result = await syncUserCalendars(1);
  revalidatePath("/week");
  return result;
}
