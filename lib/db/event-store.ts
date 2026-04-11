import { and, eq, gte, lt, ne, asc } from "drizzle-orm";
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

/**
 * Delete all events for this account whose start is inside [window.start, window.end),
 * then insert the fresh set. Transactional.
 */
export async function replaceWindow(
  accountId: number,
  userId: number,
  window: TimeWindow,
  fresh: EventInput[],
): Promise<void> {
  const db = getDb();
  db.transaction((tx) => {
    tx.delete(events)
      .where(
        and(
          eq(events.accountId, accountId),
          gte(events.startTs, window.start),
          lt(events.startTs, window.end),
        ),
      )
      .run();
    if (fresh.length === 0) return;
    const now = new Date();
    for (const e of fresh) {
      tx.insert(events)
        .values({
          userId,
          accountId,
          googleEventId: e.googleEventId,
          icalUid: e.icalUid,
          title: e.title,
          description: e.description,
          location: e.location,
          startTs: e.startTs,
          endTs: e.endTs,
          isAllDay: e.isAllDay,
          tz: e.tz,
          status: e.status,
          responseStatus: e.responseStatus,
          htmlLink: e.htmlLink,
          hangoutLink: e.hangoutLink,
          rawJson: e.rawJson,
          syncedAt: now,
        })
        .run();
    }
  });
}

/**
 * List non-declined events for a user in the window, sorted by start time.
 */
export async function listEventsInWindow(
  userId: number,
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
    .orderBy(asc(events.startTs))
    .all();
}
