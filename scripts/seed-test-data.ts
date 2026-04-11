import { eq } from "drizzle-orm";
import { __resetDbForTests, getDb } from "@/lib/db/client";
import { replaceWindow } from "@/lib/db/event-store";
import { upsertAccount } from "@/lib/db/token-store";
import { users } from "@/lib/db/schema";
import { addDays, startOfWeek } from "@/lib/time/week";

async function ensureSeedUser(userId: string, email: string) {
  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.id, userId));
  if (existing.length > 0) return existing[0];

  const [inserted] = await db
    .insert(users)
    .values({
      id: userId,
      email,
      name: "Seed User",
      emailVerified: new Date(),
      image: null,
    })
    .returning();
  return inserted;
}

async function main() {
  if (!process.env.ENCRYPTION_KEY) {
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 42).toString("base64");
  }
  process.env.DATABASE_URL ??=
    "postgresql://postgres:postgres@127.0.0.1:5432/calsync";
  process.env.GOOGLE_CLIENT_ID ??= "stub";
  process.env.GOOGLE_CLIENT_SECRET ??= "stub";
  process.env.NEXTAUTH_SECRET ??= "stub-nextauth-secret";
  process.env.NEXTAUTH_URL ??= "http://localhost:3000";

  __resetDbForTests();

  const user = await ensureSeedUser("seed-user", "seed@example.com");

  const primary = await upsertAccount({
    userId: user.id,
    googleSub: "google-seed-primary",
    googleEmail: "primary@example.com",
    refreshToken: "stub-refresh-1",
    accessToken: null,
    accessTokenExpiresAt: null,
  });
  const work = await upsertAccount({
    userId: user.id,
    googleSub: "google-seed-work",
    googleEmail: "work@example.com",
    refreshToken: "stub-refresh-2",
    accessToken: null,
    accessTokenExpiresAt: null,
  });

  const weekStart = startOfWeek(new Date());
  const window = { start: weekStart, end: addDays(weekStart, 14) };

  const mkEvent = (
    googleEventId: string,
    title: string,
    day: number,
    hourStart: number,
    hourEnd: number,
  ) => {
    const start = addDays(weekStart, day);
    start.setHours(hourStart, 0, 0, 0);
    const end = addDays(weekStart, day);
    end.setHours(hourEnd, 0, 0, 0);
    return {
      googleEventId,
      icalUid: null,
      title,
      description: "seeded for UI dev",
      location: "Zoom",
      startTs: start,
      endTs: end,
      isAllDay: false,
      tz: "UTC",
      status: "confirmed",
      responseStatus: "accepted",
      htmlLink: "https://calendar.google.com/",
      hangoutLink: null,
      rawJson: "{}",
    };
  };

  await replaceWindow(primary.id, user.id, window, [
    mkEvent("a1", "Standup", 1, 9, 10),
    mkEvent("a2", "Design sync", 2, 13, 14),
    mkEvent("a3", "1:1 Sarah", 3, 11, 12),
  ]);
  await replaceWindow(work.id, user.id, window, [
    mkEvent("b1", "CSE 599R", 1, 11, 13),
    mkEvent("b2", "LING 573", 2, 15, 17),
    mkEvent("b3", "Office hours", 4, 10, 11),
  ]);

  console.log(
    `Seeded 6 events across 2 accounts for week starting ${weekStart.toISOString()}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
