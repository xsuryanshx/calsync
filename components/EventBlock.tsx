"use client";

import type { UIEvent } from "./WeekGrid";

export function EventBlock({
  event,
  top,
  height,
  onClick,
}: {
  event: UIEvent;
  top: number;
  height: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="absolute left-1 right-1 rounded px-1.5 py-0.5 text-xs text-white text-left truncate hover:brightness-110"
      style={{
        top,
        height,
        backgroundColor: event.color,
      }}
      title={event.title}
    >
      <div className="font-medium truncate">{event.title}</div>
      <div className="opacity-90 text-[10px] truncate">
        {new Date(event.start).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })}
      </div>
    </button>
  );
}
