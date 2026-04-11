import Link from "next/link";

export function WeekSwitcher({ current }: { current: "this" | "next" }) {
  const base =
    "relative z-10 px-3.5 py-[6px] rounded-full text-center text-[12px] font-medium transition-colors duration-300";
  const active = "text-paper";
  const idle = "text-ink-soft hover:text-ink";
  return (
    <div className="relative inline-grid grid-cols-2 items-center rounded-full border border-hairline bg-white p-[3px]">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-[3px] left-[3px] w-[calc(50%-3px)] rounded-full bg-ink shadow-[0_1px_2px_rgba(26,26,23,0.12)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          current === "next" ? "translate-x-full" : "translate-x-0"
        }`}
      />
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
