import Link from "next/link";

export function ReconnectBanner({ affected }: { affected: string[] }) {
  if (affected.length === 0) return null;
  return (
    <div className="mb-4 px-4 py-3 rounded-xl bg-[#fdf2dd] border border-[#ebd9a8] text-[13px] text-[#7a4a0b] flex items-center justify-between">
      <div>
        One or more accounts need to be reconnected:{" "}
        <span className="font-mono text-[12px]">{affected.join(", ")}</span>
      </div>
      <Link href="/settings" className="underline font-medium">
        Reconnect
      </Link>
    </div>
  );
}
