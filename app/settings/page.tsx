import { listAccountsForUser } from "@/lib/db/token-store";
import { signIn } from "@/lib/auth/config";
import Link from "next/link";

export default async function SettingsPage() {
  const accounts = await listAccountsForUser(1);
  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        {accounts.length > 0 && (
          <Link href="/week" className="text-sm text-blue-600 hover:underline">
            ← Week view
          </Link>
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-3">Connected Google Accounts</h2>
        {accounts.length === 0 && (
          <p className="text-slate-500 mb-4">No accounts connected yet.</p>
        )}
        <ul className="space-y-2 mb-4">
          {accounts.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 p-3 bg-white rounded border border-slate-200"
            >
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: a.displayColor }}
              />
              <span className="font-mono text-sm">{a.googleEmail}</span>
            </li>
          ))}
        </ul>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/settings?connected=1" });
          }}
        >
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Connect Google Account
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-3">
          You&apos;ll be redirected to Google to authorize read-only calendar access.
          Repeat this step to connect a second account (sign out of the first in
          Google).
        </p>
      </section>
    </main>
  );
}
