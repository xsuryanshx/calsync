"use client";

import { EventBlock } from "./EventBlock";
import type { UIEvent } from "./WeekGrid";

const HOUR_HEIGHT = 56; // matches h-14

export function DayColumn({
  day,
  hours,
  events,
  onSelect,
}: {
  day: Date;
  hours: number[];
  events: UIEvent[];
  onSelect: (e: UIEvent) => void;
}) {
  const dayStart = new Date(day);
  dayStart.setHours(hours[0], 0, 0, 0);

  return (
    <div className="relative border-l border-slate-200">
      {hours.map((h) => (
        <div
          key={h}
          className="border-b border-slate-100"
          style={{ height: HOUR_HEIGHT }}
        />
      ))}
      {events.map((e) => {
        const s = new Date(e.start);
        const en = new Date(e.end);
        const topMin = (s.getTime() - dayStart.getTime()) / 60000;
        const durMin = (en.getTime() - s.getTime()) / 60000;
        const top = (topMin / 60) * HOUR_HEIGHT;
        const height = Math.max((durMin / 60) * HOUR_HEIGHT - 2, 18);
        if (top < 0 || top > hours.length * HOUR_HEIGHT) return null;
        return (
          <EventBlock
            key={e.id}
            event={e}
            top={top}
            height={height}
            onClick={() => onSelect(e)}
          />
        );
      })}
    </div>
  );
}
