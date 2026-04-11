"use client";

import { useEffect } from "react";
import type { UIEvent } from "./WeekGrid";

export function EventPopover({
  event,
  onClose,
}: {
  event: UIEvent;
  onClose: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const s = new Date(event.start);
  const en = new Date(event.end);
  const timeLabel = event.isAllDay
    ? `${s.toLocaleDateString()} (all day)`
    : `${s.toLocaleDateString()} · ${s.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })} – ${en.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2 mb-3">
          <span
            className="inline-block w-3 h-3 rounded-full mt-1.5"
            style={{ backgroundColor: event.color }}
          />
          <h2 className="text-lg font-semibold flex-1">{event.title}</h2>
        </div>
        <div className="text-sm text-slate-600 mb-2">{timeLabel}</div>
        {event.location && (
          <div className="text-sm text-slate-600 mb-2">📍 {event.location}</div>
        )}
        {event.description && (
          <div className="text-sm text-slate-700 mt-3 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {event.description}
          </div>
        )}
        <div className="flex gap-2 mt-5">
          {event.hangoutLink && (
            <a
              href={event.hangoutLink}
              target="_blank"
              rel="noopener"
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Join meet
            </a>
          )}
          {event.htmlLink && (
            <a
              href={event.htmlLink}
              target="_blank"
              rel="noopener"
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Open in Google Calendar
            </a>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-50 ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
