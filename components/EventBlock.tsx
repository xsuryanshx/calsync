"use client";

import type { UIEvent } from "./WeekGrid";
import { accentFor } from "@/lib/ui/palette";

export function EventBlock({
  event,
  top,
  height,
  left,
  right,
  onClick,
}: {
  event: UIEvent;
  top: number;
  height: number;
  left: string;
  right: string;
  onClick: () => void;
}) {
  const a = accentFor(event.color);
  const compact = height < 34;
  const time = new Date(event.start).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <button
      onClick={onClick}
      className="group absolute rounded-[5px] pl-2 pr-1.5 py-[3px] text-[11px] text-left overflow-hidden transition-[background-color,transform] duration-150 ease-out hover:-translate-y-[0.5px]"
      style={{
        top,
        height,
        left,
        right,
        backgroundColor: a.bg,
        color: a.text,
        borderLeft: `2.5px solid ${a.stripe}`,
      }}
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
