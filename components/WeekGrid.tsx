"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DayColumn, HOUR_HEIGHT } from "./DayColumn";
import { AllDayStrip } from "./AllDayStrip";
import { EventPopover } from "./EventPopover";
import { parseLocalDateKey } from "@/lib/time/local-date";

export type UIEvent = {
  id: string;
  accountId: string;
  accountEmail: string;
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

export type EventSelection = {
  event: UIEvent;
  anchor: DOMRect;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const INITIAL_SCROLL_HOUR = 8;
const DEFAULT_VISIBLE_HOURS = 12;

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
  const [selected, setSelected] = useState<EventSelection | null>(null);
  const [now, setNow] = useState(() => new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = (event: UIEvent, anchor: DOMRect) => {
    setSelected({ event, anchor });
  };

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = INITIAL_SCROLL_HOUR * HOUR_HEIGHT;
  }, [weekStart]);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const intervalId = window.setInterval(tick, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const todayIndex = days.findIndex((day) => sameDay(day, now));
  const currentTimeTop =
    todayIndex === -1
      ? null
      : ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT;

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
        className="grid bg-white"
        style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
      >
        <div className="border-b border-hairline" />
        {days.map((d, i) => {
          const isToday = sameDay(d, now);
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

      <AllDayStrip days={days} eventsByDay={allDayByDay} onSelect={handleSelect} />

      <div
        ref={scrollRef}
        className="overflow-y-auto overscroll-contain"
        style={{ height: DEFAULT_VISIBLE_HOURS * HOUR_HEIGHT }}
      >
        <div
          className="grid min-w-0"
          style={{ gridTemplateColumns: "64px repeat(7, minmax(0, 1fr))" }}
        >
          <div className="relative bg-white">
            {HOURS.map((h) => (
              <div
                key={h}
                className="relative pr-3 text-right text-[10px] uppercase tracking-wider text-ink-mute"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute right-3 top-0.5">
                  {h === 0 ? "12a" : (h % 12 || 12) + (h < 12 ? "a" : "p")}
                </span>
                {h < 23 && (
                  <span className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-hairline-soft/70" />
                )}
              </div>
            ))}
          </div>
          {days.map((d, i) => (
            <DayColumn
              key={i}
              day={d}
              hours={HOURS}
              events={eventsByDay[i]}
              isToday={sameDay(d, now)}
              isWeekend={i === 0 || i === 6}
              selectedId={selected?.event.id ?? null}
              onSelect={handleSelect}
              currentTimeTop={todayIndex === i ? currentTimeTop : null}
            />
          ))}
        </div>
      </div>

      {selected && (
        <EventPopover
          event={selected.event}
          anchor={selected.anchor}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
