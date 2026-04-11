import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { ensurePrimaryCalendarConnectionForUser } from "@/lib/auth/onboarding";
import { listAccountsForUser } from "@/lib/db/token-store";
import { GoogleSignInButton } from "@/components/AuthButtons";
import { BrandWordmark } from "@/components/BrandWordmark";

export default async function Home() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    return (
      <main className="min-h-screen px-8 py-12 flex items-center justify-center">
        <section className="max-w-xl w-full rounded-[28px] border border-hairline bg-white px-8 py-10 shadow-[0_30px_80px_-45px_rgba(26,26,23,0.28)]">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-mute mb-4">
            Private calendar cockpit
          </p>
          <h1>
            <BrandWordmark />
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft max-w-lg">
            Sign in with Google to create your private workspace, auto-link your
            first calendar account, and merge additional Google calendars into a
            single quiet week view.
          </p>
          <div className="mt-6 rounded-[22px] bg-paper-soft px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-mute">
              Public app details
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              Need the public-facing description for Google verification or a
              quick privacy review? Start with the app overview and legal pages.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/about"
                className="inline-flex items-center rounded-full border border-hairline bg-white px-4 py-[8px] text-[12px] font-medium text-ink-soft transition-colors hover:border-ink-mute hover:text-ink"
              >
                App overview
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center rounded-full border border-hairline bg-white px-4 py-[8px] text-[12px] font-medium text-ink-soft transition-colors hover:border-ink-mute hover:text-ink"
              >
                Privacy policy
              </Link>
              <Link
                href="/terms"
                className="inline-flex items-center rounded-full border border-hairline bg-white px-4 py-[8px] text-[12px] font-medium text-ink-soft transition-colors hover:border-ink-mute hover:text-ink"
              >
                Terms
              </Link>
            </div>
          </div>
          <div className="mt-8">
            <GoogleSignInButton label="Sign in with Google" />
          </div>
          <p className="mt-4 text-[11px] text-ink-mute leading-relaxed">
            The first Google account you use to sign in becomes your first
            linked calendar automatically. You can add more accounts later in
            settings.
          </p>
        </section>
      </main>
    );
  }

  await ensurePrimaryCalendarConnectionForUser(session.user.id);

  const accounts = await listAccountsForUser(session.user.id);
  if (accounts.length === 0) {
    redirect("/settings");
  }

  redirect("/week");
}
