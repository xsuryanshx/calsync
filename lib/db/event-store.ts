import { and, asc, eq, gte, lt, ne } from "drizzle-orm";
import { getDb } from "./client";
import { events, type Event } from "./schema";

export type EventInput = {
  googleEventId: string;
  icalUid: string | null;
  title: string | null;
  description: string | null;
  location: string | null;
  startTs: Date;
  endTs: Date;
  isAllDay: boolean;
  tz: string | null;
  status: string | null;
  responseStatus: string | null;
  htmlLink: string | null;
  hangoutLink: string | null;
  rawJson: string;
};

export type TimeWindow = { start: Date; end: Date };

export async function replaceWindow(
  accountId: string,
  userId: string,
  window: TimeWindow,
  fresh: EventInput[],
): Promise<void> {
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx.delete(events).where(
      and(
        eq(events.accountId, accountId),
        gte(events.startTs, window.start),
        lt(events.startTs, window.end),
      ),
    );
    if (fresh.length === 0) return;

    const now = new Date();
    await tx.insert(events).values(
      fresh.map((event) => ({
        userId,
        accountId,
        googleEventId: event.googleEventId,
        icalUid: event.icalUid,
        title: event.title,
        description: event.description,
        location: event.location,
        startTs: event.startTs,
        endTs: event.endTs,
        isAllDay: event.isAllDay,
        tz: event.tz,
        status: event.status,
        responseStatus: event.responseStatus,
        htmlLink: event.htmlLink,
        hangoutLink: event.hangoutLink,
        rawJson: event.rawJson,
        syncedAt: now,
      })),
    );
  });
}

export async function listEventsInWindow(
  userId: string,
  window: TimeWindow,
): Promise<Event[]> {
  const db = getDb();
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.userId, userId),
        gte(events.startTs, window.start),
        lt(events.startTs, window.end),
        ne(events.responseStatus, "declined"),
      ),
    )
    .orderBy(asc(events.startTs));
}
