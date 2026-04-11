import type { Metadata } from "next";
import Link from "next/link";
import { PublicInfoShell } from "@/components/PublicInfoShell";

export const metadata: Metadata = {
  title: "About calsync",
  description:
    "Public overview of calsync, including what the app does and how it uses Google account and Calendar data.",
};

const cards = [
  {
    title: "What calsync does",
    body:
      "calsync gives each user a private weekly dashboard that combines one or more Google Calendars into a single read-only view.",
  },
  {
    title: "Why Google access is requested",
    body:
      "Google Sign-In is used to create your app session, and Google Calendar read-only access is used to sync events into the week view.",
  },
  {
    title: "What calsync does not do",
    body:
      "calsync does not request calendar write permissions, does not edit or delete calendar entries, and does not publish calendar data on your behalf.",
  },
];

const dataUses = [
  "Basic Google account information needed to sign you in and identify linked calendar accounts.",
  "Read-only calendar event data needed to show a merged weekly schedule across your connected Google accounts.",
  "Encrypted OAuth tokens, sync status, and related metadata needed to keep your connections working securely.",
];

export default function AboutPage() {
  return (
    <PublicInfoShell
      eyebrow="Public app overview"
      title="A public summary page for users and Google reviewers."
      summary="This page exists so anyone can understand what calsync is, why it asks for Google access, and where to find the privacy policy and terms of service without needing to log in."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-[28px] border border-hairline bg-white px-6 py-6"
          >
            <h2 className="font-serif text-[26px] leading-tight text-ink">{card.title}</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{card.body}</p>
          </article>
        ))}
      </div>

      <article className="rounded-[32px] border border-hairline bg-white px-6 py-7 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <h2 className="font-serif text-[32px] leading-tight text-ink">
              How Google user data is used
            </h2>
            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-ink-soft">
              {dataUses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <aside className="rounded-[24px] bg-paper-soft px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-mute">
              Public links
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/privacy"
                className="inline-flex items-center justify-between rounded-2xl border border-hairline bg-white px-4 py-3 text-[14px] font-medium text-ink transition-colors hover:border-ink-mute"
              >
                Privacy policy
                <span className="text-ink-mute">/privacy</span>
              </Link>
              <Link
                href="/terms"
                className="inline-flex items-center justify-between rounded-2xl border border-hairline bg-white px-4 py-3 text-[14px] font-medium text-ink transition-colors hover:border-ink-mute"
              >
                Terms of service
                <span className="text-ink-mute">/terms</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-between rounded-2xl border border-hairline bg-white px-4 py-3 text-[14px] font-medium text-ink transition-colors hover:border-ink-mute"
              >
                App entry point
                <span className="text-ink-mute">/</span>
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </PublicInfoShell>
  );
}
