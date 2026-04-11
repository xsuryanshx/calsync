import { NextRequest, NextResponse } from "next/server";
import { listEventsInWindow } from "@/lib/db/event-store";
import { listAccountsForUser } from "@/lib/db/token-store";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (!from || !to) {
      return NextResponse.json({ error: "from and to required" }, { status: 400 });
    }
    const events = await listEventsInWindow(1, {
      start: new Date(from),
      end: new Date(to),
    });
    const accounts = await listAccountsForUser(1);
    const colorByAccount = Object.fromEntries(
      accounts.map((a) => [a.id, a.displayColor]),
    );
    return NextResponse.json({
      events: events.map((e) => ({
        id: e.id,
        accountId: e.accountId,
        color: colorByAccount[e.accountId],
        title: e.title,
        description: e.description,
        location: e.location,
        start: e.startTs.toISOString(),
        end: e.endTs.toISOString(),
        isAllDay: e.isAllDay,
        htmlLink: e.htmlLink,
        hangoutLink: e.hangoutLink,
      })),
    });
  } catch (err) {
    logger.error({ err: String(err) }, "/api/events failed");
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
