"use client";

import { useState, useTransition } from "react";
import { syncCalendarsAction } from "@/app/actions/sync";

export function SyncButton() {
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<string | null>(null);

  const onClick = () => {
    setLastResult(null);
    startTransition(async () => {
      try {
        const result = await syncCalendarsAction();
        const ok = result.perAccount.filter((r) => r.status === "ok").length;
        const reauth = result.perAccount
          .filter((r) => r.status === "reauth_required")
          .map((r) => r.googleEmail);
        try {
          if (reauth.length > 0) {
            sessionStorage.setItem("calsync:reauth", JSON.stringify(reauth));
          } else {
            sessionStorage.removeItem("calsync:reauth");
          }
        } catch {}
        setLastResult(`Synced ${ok}/${result.perAccount.length} accounts`);
      } catch {
        setLastResult("Sync failed");
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      {lastResult && <span className="text-xs text-slate-500">{lastResult}</span>}
      <button
        onClick={onClick}
        disabled={pending}
        className="relative px-4 py-2 rounded bg-slate-900 text-white text-sm font-medium disabled:opacity-80 overflow-hidden min-w-[88px]"
      >
        <span className={pending ? "opacity-60" : ""}>
          {pending ? "Syncing…" : "Sync"}
        </span>
        {pending && (
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
              backgroundSize: "200% 100%",
              animation: "calsync-shimmer 1.2s linear infinite",
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
