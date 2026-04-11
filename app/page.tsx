import { redirect } from "next/navigation";
import { listAccountsForUser } from "@/lib/db/token-store";

export default async function Home() {
  const accounts = await listAccountsForUser(1);
  if (accounts.length === 0) {
    redirect("/settings");
  }
  redirect("/week");
}
