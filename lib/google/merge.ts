import type { Event } from "@/lib/db/schema";

export function filterAndSort(events: Event[]): Event[] {
  return events
    .filter((e) => e.responseStatus !== "declined")
    .sort((a, b) => a.startTs.getTime() - b.startTs.getTime());
}
