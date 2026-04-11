import type { Metadata } from "next";
import { PublicInfoShell } from "@/components/PublicInfoShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for calsync.",
};

const sections = [
  {
    title: "Use of the service",
    body:
      "calsync is a private calendar dashboard that lets you sign in with Google, connect one or more Google Calendar accounts, and view a merged read-only weekly schedule. By using the service, you agree to use it only for lawful purposes and only with calendars you are authorized to access.",
  },
  {
    title: "Your Google account",
    body:
      "You are responsible for the Google accounts you connect, the permissions you grant, and the accuracy of the information you choose to sync into calsync. You may revoke access at any time from the app settings or your Google account permissions page.",
  },
  {
    title: "Availability and changes",
    body:
      "The service may change, be updated, suspended, or discontinued at any time. Features, supported environments, and integrations may also change as the product evolves.",
  },
  {
    title: "No calendar write actions",
    body:
      "calsync is designed around read-only Google Calendar access. It is not intended to modify, publish, or delete calendar content on your behalf.",
  },
  {
    title: "Disclaimer",
    body:
      "The service is provided on an as-is and as-available basis without warranties of any kind, including warranties of availability, merchantability, fitness for a particular purpose, or non-infringement.",
  },
  {
    title: "Termination",
    body:
      "Access to the service may be limited or terminated if needed to protect the service, comply with law, address abuse, or respond to security issues. You can also stop using the service at any time.",
  },
  {
    title: "Updates to these terms",
    body: "These terms may be updated from time to time. Last updated: April 11, 2026.",
  },
];

export default function TermsPage() {
  return (
    <PublicInfoShell
      eyebrow="Terms of service"
      title="The basic rules for using calsync."
      summary="These terms describe the intended use of calsync and the limitations that apply to the service."
    >
      {sections.map((section) => (
        <article
          key={section.title}
          className="rounded-[32px] border border-hairline bg-white px-6 py-7 sm:px-8"
        >
          <h2 className="font-serif text-[30px] leading-tight text-ink">{section.title}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{section.body}</p>
        </article>
      ))}
    </PublicInfoShell>
  );
}
