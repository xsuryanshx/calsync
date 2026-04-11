"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function ReconnectBanner() {
  const [affected, setAffected] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("calsync:reauth");
      if (raw) setAffected(JSON.parse(raw));
    } catch {}
  }, []);
  if (affected.length === 0) return null;
  return (
    <div className="mb-4 p-3 rounded bg-amber-50 border border-amber-200 text-sm text-amber-900 flex items-center justify-between">
      <div>
        One or more Google accounts need to be reconnected:{" "}
        <span className="font-mono">{affected.join(", ")}</span>
      </div>
      <Link href="/settings" className="underline font-medium">
        Reconnect
      </Link>
    </div>
  );
}
