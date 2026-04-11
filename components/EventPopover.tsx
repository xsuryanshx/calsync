"use client";

import { useEffect } from "react";
import type { UIEvent } from "./WeekGrid";
import { accentFor } from "@/lib/ui/palette";

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

  const a = accentFor(event.color);
  const s = new Date(event.start);
  const en = new Date(event.end);
  const dateLabel = s.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const timeLabel = event.isAllDay
    ? "All day"
    : `${s.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })} – ${en.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`;

  return (
    <div
      className="fixed inset-0 bg-[#1a1a17]/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-paper rounded-2xl shadow-[0_40px_80px_-30px_rgba(26,26,23,0.35)] border border-hairline max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-1"
          style={{ backgroundColor: a.stripe }}
          aria-hidden
        />
        <div className="p-6">
          <h2 className="font-serif text-[28px] leading-[1.15] text-ink tracking-tight mb-3">
            {event.title}
          </h2>
          <div className="text-[13px] text-ink-soft mb-1">{dateLabel}</div>
          <div className="text-[13px] text-ink-soft">{timeLabel}</div>
          {event.location && (
            <div className="flex items-start gap-2 text-[13px] text-ink-soft mt-4">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-[2px] shrink-0 opacity-70"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{event.location}</span>
            </div>
          )}
          {event.description && (
            <div className="text-[13px] text-ink-soft mt-4 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed border-t border-hairline pt-4">
              {event.description}
            </div>
          )}
          <div className="flex gap-2 mt-6">
            {event.hangoutLink && (
              <a
                href={event.hangoutLink}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full bg-ink text-paper text-[12px] font-medium hover:bg-[#33332e] transition-colors"
              >
                Join meet
              </a>
            )}
            {event.htmlLink && (
              <a
                href={event.htmlLink}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full border border-hairline bg-white text-ink text-[12px] font-medium hover:bg-paper-soft transition-colors"
              >
                Open in Google Calendar
              </a>
            )}
            <button
              onClick={onClose}
              className="ml-auto inline-flex items-center px-3.5 py-[7px] rounded-full text-[12px] text-ink-mute hover:text-ink transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
