import Link from "next/link";

export function BrandWordmark({
  href,
  size = "hero",
}: {
  href?: string;
  size?: "hero" | "header";
}) {
  const className =
    size === "hero"
      ? "font-serif italic text-[52px] leading-[0.9] text-ink tracking-tight"
      : "font-serif italic text-[34px] leading-[0.9] text-ink tracking-tight";

  const wordmark = <span className={className}>calsync</span>;

  if (!href) return wordmark;

  return (
    <Link href={href} className="inline-block hover:opacity-85 transition-opacity">
      {wordmark}
    </Link>
  );
}
