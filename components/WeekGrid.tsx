"use client";

import { useState } from "react";
import { DayColumn } from "./DayColumn";
import { AllDayStrip } from "./AllDayStrip";
import { EventPopover } from "./EventPopover";

export type UIEvent = {
  id: number;
  accountId: number;
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

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am–8pm
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeekGrid({
  weekStart,
  events,
}: {
  weekStart: string;
  events: UIEvent[];
}) {
  const start = new Date(weekStart);
  const [selected, setSelected] = useState<UIEvent | null>(null);

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
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div
        className="grid"
        style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
      >
        <div className="border-b border-slate-200 p-2" />
        {days.map((d, i) => (
          <div
            key={i}
            className="border-b border-l border-slate-200 p-2 text-center text-sm font-medium"
          >
            <div className="text-slate-500 text-xs">{DAY_LABELS[i]}</div>
            <div className="text-slate-900">{d.getDate()}</div>
          </div>
        ))}
      </div>

      <AllDayStrip days={days} eventsByDay={allDayByDay} onSelect={setSelected} />

      <div
        className="grid"
        style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
      >
        <div className="relative">
          {HOURS.map((h) => (
            <div
              key={h}
              className="h-14 text-xs text-slate-400 pr-2 text-right pt-0.5"
            >
              {(h % 12 || 12) + (h < 12 ? "am" : "pm")}
            </div>
          ))}
        </div>
        {days.map((d, i) => (
          <DayColumn
            key={i}
            day={d}
            hours={HOURS}
            events={eventsByDay[i]}
            onSelect={setSelected}
          />
        ))}
      </div>

      {selected && <EventPopover event={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
