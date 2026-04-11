"use client";

import { useState } from "react";
import { DayColumn } from "./DayColumn";
import { AllDayStrip } from "./AllDayStrip";
import { EventPopover } from "./EventPopover";
import { parseLocalDateKey } from "@/lib/time/local-date";

export type UIEvent = {
  id: string;
  accountId: string;
  color: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  isAllDay: boolean;
  htmlLink: string | null;
  hangoutLink: string | null;
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function WeekGrid({
  weekStart,
  events,
}: {
  weekStart: string;
  events: UIEvent[];
}) {
  const start = parseLocalDateKey(weekStart);
  const [selected, setSelected] = useState<UIEvent | null>(null);
  const today = new Date();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const eventsByDay: UIEvent[][] = days.map((d) => {
    const dayStart = new Date(d);
    const dayEnd = new Date(d);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return events
      .filter((e) => !e.isAllDay)
      .filter((e) => {
        const s = new Date(e.start);
        return s >= dayStart && s < dayEnd;
      });
  });

  const allDayByDay: UIEvent[][] = days.map((d) => {
    const dayStart = new Date(d);
    const dayEnd = new Date(d);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return events
      .filter((e) => e.isAllDay)
      .filter((e) => {
        const s = new Date(e.start);
        return s >= dayStart && s < dayEnd;
      });
  });

  return (
    <div className="bg-white rounded-xl border border-hairline overflow-hidden shadow-[0_1px_0_rgba(26,26,23,0.02),0_20px_50px_-30px_rgba(26,26,23,0.08)]">
      <div
        className="grid"
        style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
      >
        <div className="border-b border-hairline" />
        {days.map((d, i) => {
          const isToday = sameDay(d, today);
          const isWeekend = i === 0 || i === 6;
          return (
            <div
              key={i}
              className={`border-b border-l border-hairline-soft px-2 py-3 text-center ${
                isToday ? "bg-paper-soft/40" : isWeekend ? "bg-paper-soft/20" : ""
              }`}
            >
              <div className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">
                {DAY_LABELS[i]}
              </div>
              <div
                className={`mt-1 font-serif text-[22px] leading-none ${
                  isToday ? "text-accent" : "text-ink"
                }`}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      <AllDayStrip days={days} eventsByDay={allDayByDay} onSelect={setSelected} />

      <div
        className="grid"
        style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
      >
        <div className="relative">
          {HOURS.map((h) => (
            <div
              key={h}
              className="h-[60px] text-[10px] uppercase tracking-wider text-ink-mute pr-3 text-right pt-0.5"
            >
              {(h % 12 || 12) + (h < 12 ? "a" : "p")}
            </div>
          ))}
        </div>
        {days.map((d, i) => (
          <DayColumn
            key={i}
            day={d}
            hours={HOURS}
            events={eventsByDay[i]}
            isToday={sameDay(d, today)}
            isWeekend={i === 0 || i === 6}
            onSelect={setSelected}
          />
        ))}
      </div>

      {selected && <EventPopover event={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
