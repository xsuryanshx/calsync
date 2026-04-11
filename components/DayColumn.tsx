"use client";

import { EventBlock } from "./EventBlock";
import type { UIEvent } from "./WeekGrid";
import { layoutDayEvents } from "@/lib/ui/day-layout";

const HOUR_HEIGHT = 60;

export function DayColumn({
  day,
  hours,
  events,
  isToday,
  isWeekend,
  onSelect,
}: {
  day: Date;
  hours: number[];
  events: UIEvent[];
  isToday: boolean;
  isWeekend: boolean;
  onSelect: (e: UIEvent) => void;
}) {
  const dayStart = new Date(day);
  dayStart.setHours(hours[0], 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(hours[hours.length - 1] + 1, 0, 0, 0);
  const accountIds = Array.from(new Set(events.map((event) => event.accountId)));
  const trackCount = Math.max(accountIds.length, 1);

  return (
    <div
      className={`relative border-l border-hairline-soft ${
        isToday ? "bg-paper-soft/40" : isWeekend ? "bg-paper-soft/20" : ""
      }`}
    >
      {hours.map((h, idx) => (
        <div
          key={h}
          className={idx === 0 ? "" : "border-t border-hairline-soft"}
          style={{ height: HOUR_HEIGHT }}
        />
      ))}
      {accountIds.flatMap((accountId, trackIndex) => {
        const trackEvents = layoutDayEvents(
          events.filter((event) => event.accountId === accountId),
        );

        return trackEvents.map(({ event, column, columnCount, span }) => {
          const s = new Date(event.start);
          const en = new Date(event.end);
          const visibleStart = Math.max(s.getTime(), dayStart.getTime());
          const visibleEnd = Math.min(en.getTime(), dayEnd.getTime());
          if (visibleEnd <= visibleStart) return null;

          const topMin = (visibleStart - dayStart.getTime()) / 60000;
          const durMin = (visibleEnd - visibleStart) / 60000;
          const top = (topMin / 60) * HOUR_HEIGHT;
          const height = Math.max((durMin / 60) * HOUR_HEIGHT - 3, 20);
          if (top < 0 || top > hours.length * HOUR_HEIGHT) return null;

          const leftPercent = ((trackIndex + column / columnCount) / trackCount) * 100;
          const rightPercent =
            ((trackCount - trackIndex - (column + span) / columnCount) / trackCount) *
            100;

          return (
            <EventBlock
              key={event.id}
              event={event}
              top={top}
              height={height}
              left={`calc(${leftPercent}% + ${3 + trackIndex * 2 + column * 2}px)`}
              right={`calc(${rightPercent}% + ${
                3 + (trackCount - trackIndex - 1) * 2 + (columnCount - column - span) * 2
              }px)`}
              onClick={() => onSelect(event)}
            />
          );
        });
      })}
    </div>
  );
}
