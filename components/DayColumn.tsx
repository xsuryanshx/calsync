"use client";

import { EventBlock } from "./EventBlock";
import type { UIEvent } from "./WeekGrid";
import { layoutDayEvents } from "@/lib/ui/day-layout";

export const HOUR_HEIGHT = 60;

export function DayColumn({
  day,
  hours,
  events,
  isToday,
  isWeekend,
  selectedId,
  onSelect,
  currentTimeTop,
}: {
  day: Date;
  hours: number[];
  events: UIEvent[];
  isToday: boolean;
  isWeekend: boolean;
  selectedId: string | null;
  onSelect: (event: UIEvent, anchor: DOMRect) => void;
  currentTimeTop: number | null;
}) {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const laidOut = layoutDayEvents(events);
  const totalHeight = hours.length * HOUR_HEIGHT;

  return (
    <div
      className={`relative border-l border-hairline-soft ${
        isToday ? "bg-paper-soft/40" : isWeekend ? "bg-paper-soft/20" : ""
      }`}
      style={{ height: totalHeight }}
    >
      {hours.map((h, idx) => (
        <div
          key={h}
          className={`relative ${idx === 0 ? "" : "border-t border-hairline-soft"}`}
          style={{ height: HOUR_HEIGHT }}
        >
          {h < 23 && (
            <span className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-hairline-soft/70" />
          )}
        </div>
      ))}
      {currentTimeTop !== null && (
        <div
          className="pointer-events-none absolute inset-x-0 z-20"
          style={{ top: currentTimeTop }}
        >
          <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-[#e15544]" />
          <span className="absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-[#e15544]" />
        </div>
      )}
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
