"use client";

import type { UIEvent } from "./WeekGrid";

export function AllDayStrip({
  days,
  eventsByDay,
  onSelect,
}: {
  days: Date[];
  eventsByDay: UIEvent[][];
  onSelect: (e: UIEvent) => void;
}) {
  const hasAny = eventsByDay.some((arr) => arr.length > 0);
  if (!hasAny) return null;
  return (
    <div
      className="grid border-b border-slate-200 bg-slate-50"
      style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
    >
      <div className="text-xs text-slate-400 pr-2 text-right pt-1">all-day</div>
      {days.map((_, i) => (
        <div
          key={i}
          className="border-l border-slate-200 p-1 min-h-[32px] space-y-1"
        >
          {eventsByDay[i].map((e) => (
            <button
              key={e.id}
              onClick={() => onSelect(e)}
              className="block w-full text-left text-xs truncate rounded px-1.5 py-0.5 text-white hover:brightness-110"
              style={{ backgroundColor: e.color }}
              title={e.title}
            >
              {e.title}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
