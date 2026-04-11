"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  autoSyncCalendarsAction,
  syncCalendarsAction,
} from "@/app/actions/sync";

export function SyncButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<string | null>(null);
  const didAutoSync = useRef(false);

  const runSync = (mode: "auto" | "manual") => {
    startTransition(async () => {
      try {
        const result =
          mode === "auto"
            ? await autoSyncCalendarsAction()
            : await syncCalendarsAction();
        const ok = result.perAccount.filter((r) => r.status === "ok").length;
        setLastResult(`Synced ${ok}/${result.perAccount.length}`);
        router.refresh();
      } catch {
        if (mode === "manual") {
          setLastResult("Sync failed");
        }
      }
    });
  };

  useEffect(() => {
    if (didAutoSync.current) return;
    didAutoSync.current = true;
    setLastResult(null);
    runSync("auto");
  }, []);

  const onClick = () => {
    setLastResult(null);
    runSync("manual");
  };

  return (
    <div className="flex items-center gap-3">
      {lastResult && (
        <span className="text-[11px] text-ink-mute tracking-tight">
          {lastResult}
        </span>
      )}
      <button
        onClick={onClick}
        disabled={pending}
        className="relative inline-flex items-center gap-1.5 px-4 py-[7px] rounded-full bg-ink text-paper text-[12px] font-medium disabled:opacity-90 overflow-hidden min-w-[88px] justify-center hover:bg-[#33332e] transition-colors"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={pending ? "animate-spin" : ""}
          aria-hidden
        >
          <path d="M21 12a9 9 0 0 1-15.36 6.36M3 12a9 9 0 0 1 15.36-6.36" />
          <path d="M21 4v6h-6" />
          <path d="M3 20v-6h6" />
        </svg>
        <span className={pending ? "opacity-80" : ""}>
          {pending ? "Syncing…" : "Sync"}
        </span>
        {pending && (
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
              backgroundSize: "200% 100%",
              animation: "calsync-shimmer 1.4s linear infinite",
            }}
          />
        )}
      </button>
      <style jsx>{`
        @keyframes calsync-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
