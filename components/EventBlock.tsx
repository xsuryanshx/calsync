"use client";

import { useRef } from "react";
import type { CSSProperties } from "react";
import type { UIEvent } from "./WeekGrid";
import { accentFor } from "@/lib/ui/palette";

export function EventBlock({
  event,
  top,
  height,
  leftPct,
  widthPct,
  isSelected,
  isDimmed,
  onSelect,
}: {
  event: UIEvent;
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: (event: UIEvent, anchor: DOMRect) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const a = accentFor(event.color);
  const compact = height < 34;
  const time = new Date(event.start).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const selectedShadow = `0 16px 32px -16px ${a.stripe}b3, 0 0 0 1.5px ${a.stripe}`;

  const style: CSSProperties & Record<string, string | number> = {
    top,
    height,
    left: `calc(${leftPct}% + 2px)`,
    width: `calc(${widthPct}% - 4px)`,
    backgroundColor: a.bg,
    color: a.text,
    borderLeft: `2.5px solid ${a.stripe}`,
    "--stripe": a.stripe,
    "--bg-hover": a.bgHover,
  };
  if (isSelected) {
    style.boxShadow = selectedShadow;
  }

  const stateClass = isSelected
    ? "z-30"
    : "z-10 hover:z-20 shadow-[0_1px_2px_0_rgba(26,26,23,0.05)] hover:shadow-[0_12px_26px_-12px_rgba(26,26,23,0.38),0_0_0_1.5px_var(--stripe)] hover:[background-color:var(--bg-hover)] hover:-translate-y-[0.5px]";

  return (
    <button
      ref={ref}
      type="button"
      data-event-block="true"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (ref.current) onSelect(event, ref.current.getBoundingClientRect());
      }}
      className={`group absolute rounded-[6px] pl-2 pr-1.5 py-[3px] text-[11px] text-left overflow-hidden transition-[transform,box-shadow,background-color,opacity] duration-150 ease-out ${stateClass} ${
        isDimmed ? "opacity-[0.55]" : "opacity-100"
      }`}
      style={style}
      title={`${event.title} · ${time}`}
    >
      <div className="font-semibold truncate leading-[1.15] tracking-[-0.005em]">
        {event.title}
      </div>
      {!compact && (
        <div className="text-[10px] truncate leading-tight mt-[1px] opacity-75">
          {time}
        </div>
      )}
    </button>
  );
}
