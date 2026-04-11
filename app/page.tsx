import { redirect } from "next/navigation";
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
          <div className="mt-8">
            <GoogleSignInButton label="Log in with Google" />
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
