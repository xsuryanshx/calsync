import Link from "next/link";
import { BrandWordmark } from "@/components/BrandWordmark";

type PublicInfoShellProps = {
  eyebrow: string;
  title: string;
  summary: string;
  children: React.ReactNode;
};

const navLinks = [
  { href: "/about", label: "Overview" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/", label: "Open app" },
];

export function PublicInfoShell({
  eyebrow,
  title,
  summary,
  children,
}: PublicInfoShellProps) {
  return (
    <main className="min-h-screen px-6 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-6 rounded-[32px] border border-hairline bg-white px-6 py-6 shadow-[0_30px_80px_-45px_rgba(26,26,23,0.28)] sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <BrandWordmark href="/" size="header" />
              <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-ink-mute">
                {eyebrow}
              </p>
            </div>
            <nav className="flex flex-wrap gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center rounded-full border border-hairline px-4 py-[8px] text-[12px] font-medium text-ink-soft transition-colors hover:border-ink-mute hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="max-w-3xl">
            <h1 className="font-serif text-[36px] leading-tight tracking-tight text-ink sm:text-[48px]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft sm:text-[16px]">
              {summary}
            </p>
          </div>
        </header>
        <section className="grid gap-6">{children}</section>
      </div>
    </main>
  );
}
