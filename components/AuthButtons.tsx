import Link from "next/link";
import { signIn, signOut } from "@/auth";

type ButtonProps = {
  className?: string;
  label?: string;
  redirectTo?: string;
};

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 18 18"
      className="h-[18px] w-[18px] shrink-0"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.33-1.58-5.04-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.36l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.95l3 2.33C4.67 5.16 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  className,
  label = "Sign in with Google",
  redirectTo = "/",
}: ButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo });
      }}
    >
      <button
        type="submit"
        className={
          className ??
          "inline-flex items-center gap-3 rounded-full border border-[#dadce0] bg-white px-5 py-[10px] text-[13px] font-medium text-[#3c4043] shadow-[0_1px_2px_rgba(60,64,67,0.16)] transition-colors hover:bg-[#f8f9fa] hover:shadow-[0_1px_3px_rgba(60,64,67,0.24)]"
        }
      >
        <GoogleMark />
        {label}
      </button>
    </form>
  );
}

export function LogoutButton({
  className,
  label = "Log out",
  redirectTo = "/",
}: ButtonProps) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo });
      }}
    >
      <button
        type="submit"
        className={
          className ??
          "inline-flex items-center rounded-full border border-hairline px-4 py-[8px] text-[12px] font-medium text-ink-soft transition-colors hover:border-ink-mute hover:text-ink"
        }
      >
        {label}
      </button>
    </form>
  );
}

export function SettingsButton({ className }: { className?: string }) {
  return (
    <Link
      href="/settings"
      className={
        className ??
        "inline-flex items-center rounded-full border border-hairline px-4 py-[8px] text-[12px] font-medium text-ink-soft transition-colors hover:border-ink-mute hover:text-ink"
      }
    >
      Settings
    </Link>
  );
}
