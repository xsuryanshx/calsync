import { NextResponse } from "next/server";
import { syncUserCalendars } from "@/lib/sync/sync-user";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const result = await syncUserCalendars(1);
    return NextResponse.json(result);
  } catch (err) {
    logger.error({ err: String(err) }, "/api/sync failed");
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
