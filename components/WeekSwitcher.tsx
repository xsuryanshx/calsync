import Link from "next/link";

export function WeekSwitcher({ current }: { current: "this" | "next" }) {
  const base =
    "px-3.5 py-[6px] rounded-full text-[12px] font-medium transition-colors";
  const active = "bg-ink text-paper";
  const idle = "text-ink-soft hover:text-ink";
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-hairline bg-white p-[3px]">
      <Link
        href="/week"
        className={`${base} ${current === "this" ? active : idle}`}
      >
        This week
      </Link>
      <Link
        href="/week?w=next"
        className={`${base} ${current === "next" ? active : idle}`}
      >
        Next week
      </Link>
    </div>
  );
}
