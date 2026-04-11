import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function getCurrentSession() {
  return auth();
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/");
  }
  return userId;
}
