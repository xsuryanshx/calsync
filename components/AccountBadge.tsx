"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { nextSelectedAccountIds } from "@/lib/ui/account-filter";

export function AccountBadge({
  accountId,
  email,
  color,
  selectedAccountIds,
  allAccountIds,
}: {
  accountId: string;
  email: string;
  color: string;
  selectedAccountIds: string[];
  allAccountIds: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = selectedAccountIds.includes(accountId);

  const onClick = () => {
    const nextSelected = nextSelectedAccountIds(
      accountId,
      selectedAccountIds,
      allAccountIds,
    );
    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextSelected.length === allAccountIds.length) {
      nextParams.delete("accounts");
    } else {
      nextParams.set("accounts", nextSelected.join(","));
    }
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center gap-2 pl-2 pr-3 py-[5px] rounded-full border text-[11px] transition-colors ${
        selected
          ? "bg-white border-hairline text-ink shadow-[0_1px_2px_rgba(26,26,23,0.08)]"
          : "bg-paper-soft/70 border-hairline-soft text-ink-mute hover:text-ink hover:border-hairline"
      }`}
      title={selected ? `Hide or expand ${email}` : `Show ${email}`}
    >
      <span
        className="h-[7px] w-[7px] rounded-full ring-[2px] ring-white"
        style={{ backgroundColor: color, boxShadow: `0 0 0 1px ${color}22` }}
      />
      <span className="tracking-tight">{email}</span>
    </button>
  );
}
