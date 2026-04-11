import Link from "next/link";
import { signIn, signOut } from "@/auth";

type ButtonProps = {
  className?: string;
  label?: string;
  redirectTo?: string;
};

export function GoogleSignInButton({
  className,
  label = "Log in with Google",
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
          "inline-flex items-center gap-2 px-5 py-[10px] rounded-full bg-ink text-paper text-[13px] font-medium hover:bg-[#33332e] transition-colors"
        }
      >
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
