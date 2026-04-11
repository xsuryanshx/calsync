import type { Metadata } from "next";
import { PublicInfoShell } from "@/components/PublicInfoShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for calsync, including how Google account and calendar data is accessed, used, stored, and shared.",
};

const sections = [
  {
    title: "Information calsync collects",
    body: [
      "calsync collects the minimum Google account data needed to sign you in and link your calendars, such as your Google account identifier and email address.",
      "When you connect Google Calendar, calsync stores the read-only calendar data needed to show your unified week view, including calendar metadata and event details from calendars you choose to sync.",
      "calsync also stores encrypted OAuth credentials, sync state, account connection status, and limited operational logs needed to keep the service working and diagnose failures.",
    ],
  },
  {
    title: "How calsync uses Google user data",
    body: [
      "Google user data is used only to authenticate you, connect your chosen Google Calendar accounts, sync read-only calendar information, and render the in-app weekly calendar view.",
      "calsync does not request calendar write access and does not create, edit, delete, or share calendar events on your behalf.",
      "calsync does not sell Google user data. Google user data is only used for the app features described on this site and in this policy.",
    ],
  },
  {
    title: "Storage and sharing",
    body: [
      "Refresh tokens are encrypted before storage. Calendar and account data are stored in the app's configured infrastructure so the service can render your schedule and keep account links active.",
      "Data may be processed by infrastructure providers used to host the application and its supporting database or cache. That processing is limited to operating the service.",
      "calsync may disclose information if required to comply with law, enforce service terms, or protect the security of the service and its users.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can stop using calsync at any time, disconnect linked calendars from the app's settings, or revoke the app's access from your Google account permissions page.",
      "Previously synced information may remain in backups or operational records for a limited period where reasonably necessary for security, compliance, or recovery.",
    ],
  },
  {
    title: "Policy changes",
    body: [
      "If calsync changes how it accesses, uses, stores, or shares Google user data, this privacy policy will be updated before the new practices take effect.",
      "Last updated: April 11, 2026.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PublicInfoShell
      eyebrow="Privacy policy"
      title="How calsync handles Google account and calendar data."
      summary="This policy explains what information calsync accesses, how that information is used, how it is stored, and the choices available to users."
    >
      {sections.map((section) => (
        <article
          key={section.title}
          className="rounded-[32px] border border-hairline bg-white px-6 py-7 sm:px-8"
        >
          <h2 className="font-serif text-[30px] leading-tight text-ink">{section.title}</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      ))}
    </PublicInfoShell>
  );
}
