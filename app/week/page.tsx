import { listEventsInWindow } from "@/lib/db/event-store";
import { requireUserId } from "@/lib/auth/session";
import { listAccountsForUser } from "@/lib/db/token-store";
import { redirect } from "next/navigation";
import Link from "next/link";
import { startOfWeek, addDays } from "@/lib/time/week";
import { formatLocalDateKey } from "@/lib/time/local-date";
import { WeekGrid } from "@/components/WeekGrid";
import { SyncButton } from "@/components/SyncButton";
import { AccountBadge } from "@/components/AccountBadge";
import { ReconnectBanner } from "@/components/ReconnectBanner";
import { WeekSwitcher } from "@/components/WeekSwitcher";
import { LogoutButton, SettingsButton } from "@/components/AuthButtons";
import { BrandWordmark } from "@/components/BrandWordmark";
import { parseSelectedAccountIds } from "@/lib/ui/account-filter";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ w?: string; accounts?: string }>;

function formatRange(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  const monthFmt: Intl.DateTimeFormatOptions = { month: "long" };
  const sMonth = start.toLocaleDateString(undefined, monthFmt);
  const eMonth = end.toLocaleDateString(undefined, monthFmt);
  if (sameMonth && sameYear) {
    return `${sMonth} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
  }
  if (sameYear) {
    return `${sMonth} ${start.getDate()} – ${eMonth} ${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${sMonth} ${start.getDate()}, ${start.getFullYear()} – ${eMonth} ${end.getDate()}, ${end.getFullYear()}`;
}

export default async function WeekPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const userId = await requireUserId();
  const params = await searchParams;
  const accounts = await listAccountsForUser(userId);
  if (accounts.length === 0) redirect("/settings");
  const allAccountIds = accounts.map((account) => account.id);
  const selectedAccountIds = parseSelectedAccountIds(params.accounts, allAccountIds);
  const selectedAccountIdSet = new Set(selectedAccountIds);

  const offset = params.w === "next" ? 1 : 0;
  const weekStart = addDays(startOfWeek(new Date()), offset * 7);
  const weekEnd = addDays(weekStart, 7);
  const rangeLabel = formatRange(weekStart, addDays(weekStart, 6));

  const events = await listEventsInWindow(userId, {
    start: weekStart,
    end: weekEnd,
  });
  const colorByAccount = Object.fromEntries(
    accounts.map((a) => [a.id, a.displayColor]),
  );
  const emailByAccount = Object.fromEntries(
    accounts.map((a) => [a.id, a.googleEmail]),
  );

  const uiEvents = events
    .filter((event) => selectedAccountIdSet.has(event.accountId))
    .map((e) => ({
      id: e.id,
      accountId: e.accountId,
      accountEmail: emailByAccount[e.accountId] ?? "",
      color: colorByAccount[e.accountId],
      title: e.title ?? "(no title)",
      description: e.description ?? "",
      location: e.location ?? "",
      start: e.startTs.toISOString(),
      end: e.endTs.toISOString(),
      isAllDay: e.isAllDay,
      htmlLink: e.htmlLink ?? null,
      hangoutLink: e.hangoutLink ?? null,
    }));

  return (
    <main className="max-w-[1400px] mx-auto px-8 py-10">
      <header className="flex items-end justify-between mb-8 pb-6 border-b border-hairline gap-6 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="leading-none">
            <BrandWordmark href="/week" size="header" />
          </h1>
          <div className="hidden sm:block">
            <div className="text-[10px] uppercase tracking-[0.16em] text-ink-mute">
              Week of
            </div>
            <div className="text-[13px] text-ink-soft mt-[2px]">
              {rangeLabel}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-end">
          <div className="flex gap-1.5 flex-wrap">
            {accounts.map((a) => (
              <AccountBadge
                key={a.id}
                accountId={a.id}
                email={a.googleEmail}
                color={a.displayColor}
                selectedAccountIds={selectedAccountIds}
                allAccountIds={allAccountIds}
              />
            ))}
            <Link
              href="/settings"
              className="inline-flex items-center gap-1 pl-2 pr-3 py-[5px] rounded-full border border-dashed border-hairline text-[11px] text-ink-mute hover:text-ink hover:border-ink-mute transition-colors"
              title="Add account"
            >
              <span className="text-[13px] leading-none">+</span>
              <span>Add</span>
            </Link>
          </div>
          <WeekSwitcher current={offset === 0 ? "this" : "next"} />
          <SyncButton />
          <div className="flex items-center gap-2">
            <SettingsButton />
            <LogoutButton />
          </div>
        </div>
      </header>
      <ReconnectBanner
        affected={accounts
          .filter((account) => account.status === "reauth_required")
          .map((account) => account.googleEmail)}
      />
      <WeekGrid weekStart={formatLocalDateKey(weekStart)} events={uiEvents} />
      <footer className="mt-8 text-[11px] text-ink-mute tracking-tight">
        Read-only view. Connect up to any number of Google accounts.
      </footer>
    </main>
  );
}
