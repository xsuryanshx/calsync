"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { UIEvent } from "./WeekGrid";
import { accentFor } from "@/lib/ui/palette";

const POPOVER_WIDTH = 384;
const GAP = 10;
const VIEWPORT_MARGIN = 16;

type Position = {
  top: number;
  left: number;
  origin: string;
};

function computePosition(anchor: DOMRect, estimatedHeight: number): Position {
  const vw =
    typeof window === "undefined" ? 1400 : window.innerWidth;
  const vh =
    typeof window === "undefined" ? 900 : window.innerHeight;

  let left = anchor.right + GAP;
  let origin = "left center";
  if (left + POPOVER_WIDTH > vw - VIEWPORT_MARGIN) {
    const flipped = anchor.left - POPOVER_WIDTH - GAP;
    if (flipped >= VIEWPORT_MARGIN) {
      left = flipped;
      origin = "right center";
    } else {
      left = Math.min(
        Math.max(
          VIEWPORT_MARGIN,
          anchor.left + anchor.width / 2 - POPOVER_WIDTH / 2,
        ),
        vw - POPOVER_WIDTH - VIEWPORT_MARGIN,
      );
      origin = "center top";
    }
  }

  let top = anchor.top;
  if (top + estimatedHeight > vh - VIEWPORT_MARGIN) {
    top = vh - estimatedHeight - VIEWPORT_MARGIN;
  }
  if (top < VIEWPORT_MARGIN) top = VIEWPORT_MARGIN;

  return { top, left, origin };
}

export function EventPopover({
  event,
  anchor,
  onClose,
}: {
  event: UIEvent;
  anchor: DOMRect;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<Position>(() => computePosition(anchor, 260));

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos(computePosition(anchor, rect.height));
  }, [anchor, event.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      const target = e.target as HTMLElement | null;
      if (ref.current.contains(target)) return;
      if (target?.closest("[data-event-block]")) return;
      onClose();
    };
    const onScroll = () => onClose();
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [onClose]);

  if (!mounted) return null;

  const a = accentFor(event.color);
  const htmlLinkWithAuth = event.htmlLink
    ? withAuthUser(event.htmlLink, event.accountEmail)
    : null;
  const s = new Date(event.start);
  const en = new Date(event.end);
  const dateLabel = s.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const timeLabel = event.isAllDay
    ? "All day"
    : `${fmtTime(s)} – ${fmtTime(en)}`;

  const durMinutes = Math.max(0, Math.round((en.getTime() - s.getTime()) / 60000));
  const durLabel =
    event.isAllDay || durMinutes === 0
      ? ""
      : durMinutes >= 60
      ? `${Math.floor(durMinutes / 60)}h${
          durMinutes % 60 ? ` ${durMinutes % 60}m` : ""
        }`
      : `${durMinutes}m`;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-label={event.title}
      className="fixed z-50 animate-popover"
      style={{
        top: pos.top,
        left: pos.left,
        width: POPOVER_WIDTH,
        transformOrigin: pos.origin,
      }}
    >
      <div className="relative rounded-2xl bg-paper border border-hairline shadow-[0_28px_72px_-28px_rgba(26,26,23,0.45),0_6px_16px_-6px_rgba(26,26,23,0.08)] overflow-hidden">
        <span
          aria-hidden
          className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
          style={{ backgroundColor: a.stripe }}
        />

        <div className="flex items-center justify-end gap-[2px] px-2 pt-2">
          {htmlLinkWithAuth && (
            <a
              href={htmlLinkWithAuth}
              target="_blank"
              rel="noopener"
              title="Open in Google Calendar"
              className="p-1.5 rounded-md text-ink-mute hover:text-ink hover:bg-paper-soft transition-colors"
            >
              <ExternalLinkIcon />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="p-1.5 rounded-md text-ink-mute hover:text-ink hover:bg-paper-soft transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="pl-7 pr-6 pt-1 pb-6">
          <div className="flex items-start gap-2.5 mb-4">
            <span
              aria-hidden
              className="mt-[8px] shrink-0 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: a.stripe }}
            />
            <h2 className="font-serif text-[22px] leading-[1.2] text-ink tracking-tight">
              {event.title}
            </h2>
          </div>

          <div className="pl-5 space-y-[10px] text-[12.5px] text-ink-soft">
            <Row icon={<ClockIcon />}>
              <div className="text-ink">
                {timeLabel}
                {durLabel ? (
                  <span className="text-ink-mute">, {durLabel}</span>
                ) : null}
              </div>
              <div className="text-ink-mute text-[11.5px] mt-[2px]">{dateLabel}</div>
            </Row>

            {event.location && (
              <Row icon={<PinIcon />}>
                <span className="text-ink break-words">{event.location}</span>
              </Row>
            )}

            {event.accountEmail && (
              <Row icon={<CalendarIcon />}>
                <span className="break-all">{event.accountEmail}</span>
              </Row>
            )}

            {event.hangoutLink && (
              <Row icon={<VideoIcon />}>
                <a
                  href={event.hangoutLink}
                  target="_blank"
                  rel="noopener"
                  className="text-ink underline decoration-hairline underline-offset-[3px] hover:decoration-ink-mute transition-colors"
                >
                  Join Google Meet
                </a>
              </Row>
            )}

            {event.description && (
              <div className="border-t border-hairline-soft pt-3 mt-3 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed text-[12px] text-ink-soft pr-1">
                {event.description}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function withAuthUser(href: string, email: string): string {
  if (!email) return href;
  try {
    const url = new URL(href);
    if (!/\.google\.com$/.test(url.hostname) && url.hostname !== "google.com") {
      return href;
    }
    url.searchParams.set("authuser", email);
    return url.toString();
  } catch {
    return href;
  }
}

function Row({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-[3px] shrink-0 text-ink-mute">{icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10l5-3v10l-5-3" />
    </svg>
  );
}
