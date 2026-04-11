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
  selectedId,
  onSelect,
}: {
  day: Date;
  hours: number[];
  events: UIEvent[];
  isToday: boolean;
  isWeekend: boolean;
  selectedId: string | null;
  onSelect: (event: UIEvent, anchor: DOMRect) => void;
}) {
  const dayStart = new Date(day);
  dayStart.setHours(hours[0], 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(hours[hours.length - 1] + 1, 0, 0, 0);

  const laidOut = layoutDayEvents(events);

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
      {laidOut.map(({ event, column, columnCount, span }) => {
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

        const widthPct = (span / columnCount) * 100;
        const leftPct = (column / columnCount) * 100;

        return (
          <EventBlock
            key={event.id}
            event={event}
            top={top}
            height={height}
            leftPct={leftPct}
            widthPct={widthPct}
            isSelected={selectedId === event.id}
            isDimmed={selectedId !== null && selectedId !== event.id}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}
