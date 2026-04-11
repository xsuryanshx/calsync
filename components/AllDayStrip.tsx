"use client";

import type { UIEvent } from "./WeekGrid";
import { accentFor } from "@/lib/ui/palette";

export function AllDayStrip({
  days,
  eventsByDay,
  onSelect,
}: {
  days: Date[];
  eventsByDay: UIEvent[][];
  onSelect: (event: UIEvent, anchor: DOMRect) => void;
}) {
  const hasAny = eventsByDay.some((arr) => arr.length > 0);
  if (!hasAny) return null;
  return (
    <div
      className="grid border-b border-hairline bg-paper-soft/50"
      style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
    >
      <div className="text-[10px] uppercase tracking-[0.1em] text-ink-mute pr-3 pt-2 text-right">
        all-day
      </div>
      {days.map((_, i) => (
        <div
          key={i}
          className={`border-l border-hairline-soft p-1 min-h-[30px] space-y-[3px] ${
            i === 0 || i === 6 ? "bg-paper-soft/20" : ""
          }`}
        >
          {eventsByDay[i].map((e) => {
            const a = accentFor(e.color);
            return (
              <button
                key={e.id}
                type="button"
                data-event-block="true"
                onClick={(ev) =>
                  onSelect(
                    e,
                    (ev.currentTarget as HTMLButtonElement).getBoundingClientRect(),
                  )
                }
                className="block w-full text-left text-[11px] font-medium truncate rounded-[4px] pl-2 pr-1.5 py-[2px] transition-[background-color,box-shadow] hover:shadow-[0_4px_10px_-6px_rgba(26,26,23,0.25)]"
                style={{
                  backgroundColor: a.bg,
                  color: a.text,
                  borderLeft: `2px solid ${a.stripe}`,
                }}
                title={e.title}
              >
                {e.title}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
