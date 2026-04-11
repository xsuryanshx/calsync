import { listEventsInWindow } from "@/lib/db/event-store";
import { listAccountsForUser } from "@/lib/db/token-store";
import { redirect } from "next/navigation";
import { startOfWeek, addDays } from "@/lib/time/week";
import { WeekGrid } from "@/components/WeekGrid";
import { SyncButton } from "@/components/SyncButton";
import { AccountBadge } from "@/components/AccountBadge";
import { ReconnectBanner } from "@/components/ReconnectBanner";
import { WeekSwitcher } from "@/components/WeekSwitcher";

type SearchParams = Promise<{ w?: string }>;

export default async function WeekPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const accounts = await listAccountsForUser(1);
  if (accounts.length === 0) redirect("/settings");

  const offset = params.w === "next" ? 1 : 0;
  const weekStart = addDays(startOfWeek(new Date()), offset * 7);
  const weekEnd = addDays(weekStart, 7);

  const events = await listEventsInWindow(1, { start: weekStart, end: weekEnd });
  const colorByAccount = Object.fromEntries(accounts.map((a) => [a.id, a.displayColor]));

  const uiEvents = events.map((e) => ({
    id: e.id,
    accountId: e.accountId,
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
    <main className="max-w-[1400px] mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">calsync</h1>
          <div className="flex gap-2 flex-wrap">
            {accounts.map((a) => (
              <AccountBadge key={a.id} email={a.googleEmail} color={a.displayColor} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <WeekSwitcher current={offset === 0 ? "this" : "next"} />
          <SyncButton />
        </div>
      </header>
      <ReconnectBanner />
      <WeekGrid weekStart={weekStart.toISOString()} events={uiEvents} />
    </main>
  );
}
