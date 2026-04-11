import { requireUserId } from "@/lib/auth/session";
import { listAccountsForUser } from "@/lib/db/token-store";
import Link from "next/link";
import { LogoutButton } from "@/components/AuthButtons";
import { removeAccountAction } from "./actions";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const accounts = await listAccountsForUser(userId);
  const reauthAccounts = accounts.filter((account) => account.status === "reauth_required");

  return (
    <main className="max-w-2xl mx-auto px-8 py-12">
      <header className="flex items-end justify-between mb-10 pb-6 border-b border-hairline">
        <div>
          <h1 className="font-serif italic text-[44px] leading-[0.9] text-ink tracking-tight">
            Settings
          </h1>
          <p className="text-[12px] text-ink-mute mt-2 uppercase tracking-[0.14em]">
            Connected accounts
          </p>
        </div>
        <div className="flex items-center gap-4">
          {accounts.length > 0 && (
            <Link
              href="/week"
              className="text-[12px] text-ink-soft hover:text-ink transition-colors"
            >
              ← Back to week
            </Link>
          )}
          <LogoutButton />
        </div>
      </header>

      <section>
        {reauthAccounts.length > 0 && (
          <div className="mb-5 rounded-xl border border-[#ebd9a8] bg-[#fdf2dd] px-4 py-3 text-[12px] text-[#7a4a0b] leading-relaxed">
            Some accounts need to be reconnected. Choose the same Google account
            again to refresh its access.
          </div>
        )}
        {accounts.length === 0 ? (
          <p className="text-[14px] text-ink-soft mb-6 leading-relaxed">
            No accounts connected yet. Authorize read-only access to each
            Google Calendar you&apos;d like to see in the unified view.
          </p>
        ) : (
          <ul className="space-y-2 mb-6">
            {accounts.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-hairline"
              >
                <span
                  className="inline-block w-[9px] h-[9px] rounded-full ring-[3px] ring-white"
                  style={{
                    backgroundColor: a.displayColor,
                    boxShadow: `0 0 0 1px ${a.displayColor}33`,
                  }}
                />
                <span className="text-[13px] text-ink tracking-tight">
                  {a.googleEmail}
                </span>
                <span className="ml-auto text-[11px] text-ink-mute">
                  {a.status === "reauth_required" ? "Reconnect needed" : "Active"}
                </span>
                <form action={removeAccountAction}>
                  <input type="hidden" name="accountId" value={a.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-hairline text-[15px] leading-none text-ink-mute transition-colors hover:border-[#d7b7af] hover:text-[#b14c2b]"
                    aria-label={`Remove ${a.googleEmail}`}
                    title={`Remove ${a.googleEmail}`}
                  >
                    ×
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <a
          href="/api/google/link"
          className="inline-flex items-center gap-2 px-5 py-[9px] bg-ink text-paper rounded-full text-[13px] font-medium hover:bg-[#33332e] transition-colors"
        >
          <span className="text-[15px] leading-none">+</span>
          {accounts.length === 0
            ? "Connect Google Account"
            : "Add another account"}
        </a>
        <p className="text-[11px] text-ink-mute mt-4 leading-relaxed max-w-md">
          Google&apos;s account picker will appear — choose the account you
          want to connect. You can add as many as you like; each gets its own
          color on the week view.
        </p>
      </section>
    </main>
  );
}
