import Link from "next/link";

export function WeekSwitcher({ current }: { current: "this" | "next" }) {
  return (
    <div className="inline-flex rounded border border-slate-200 overflow-hidden text-sm">
      <Link
        href="/week"
        className={`px-3 py-1.5 ${
          current === "this"
            ? "bg-slate-900 text-white"
            : "bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        This week
      </Link>
      <Link
        href="/week?w=next"
        className={`px-3 py-1.5 border-l border-slate-200 ${
          current === "next"
            ? "bg-slate-900 text-white"
            : "bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        Next week
      </Link>
    </div>
  );
}
