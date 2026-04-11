"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth/session";
import { deleteAccountForUser } from "@/lib/db/token-store";

const removeAccountSchema = z.object({
  accountId: z.uuid(),
});

export async function removeAccountAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const parsed = removeAccountSchema.safeParse({
    accountId: formData.get("accountId"),
  });

  if (!parsed.success) {
    throw new Error("invalid account id");
  }

  await deleteAccountForUser(userId, parsed.data.accountId);
  revalidatePath("/settings");
  revalidatePath("/week");
}
