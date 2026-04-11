import type { calendar_v3 } from "googleapis";
import type { EventInput } from "@/lib/db/event-store";

export function mapGoogleEvent(g: calendar_v3.Schema$Event): EventInput {
  const isAllDay = Boolean(g.start?.date && !g.start?.dateTime);
  const startIso = g.start?.dateTime ?? g.start?.date;
  const endIso = g.end?.dateTime ?? g.end?.date;
  if (!startIso || !endIso) {
    throw new Error(`event ${g.id} has no start/end`);
  }
  const startTs = new Date(startIso);
  const endTs = new Date(endIso);

  const selfAttendee = (g.attendees ?? []).find((a) => a.self);
  const responseStatus = selfAttendee?.responseStatus ?? "accepted";

  return {
    googleEventId: g.id ?? "",
    icalUid: g.iCalUID ?? null,
    title: g.summary ?? null,
    description: g.description ?? null,
    location: g.location ?? null,
    startTs,
    endTs,
    isAllDay,
    tz: g.start?.timeZone ?? null,
    status: g.status ?? null,
    responseStatus,
    htmlLink: g.htmlLink ?? null,
    hangoutLink: g.hangoutLink ?? null,
    rawJson: JSON.stringify(g),
  };
}
