import { __resetDbForTests } from "@/lib/db/client";
import { upsertAccount } from "@/lib/db/token-store";
import { replaceWindow } from "@/lib/db/event-store";
import { startOfWeek, addDays } from "@/lib/time/week";

async function main() {
  if (!process.env.ENCRYPTION_KEY) {
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 42).toString("base64");
  }
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./calsync.db";
  }
  process.env.GOOGLE_CLIENT_ID ??= "stub";
  process.env.GOOGLE_CLIENT_SECRET ??= "stub";
  process.env.NEXTAUTH_SECRET ??= "stub-nextauth-secret";
  process.env.NEXTAUTH_URL ??= "http://localhost:3000";

  __resetDbForTests();

  const a = await upsertAccount({
    userId: 1,
    googleEmail: "primary@example.com",
    refreshToken: "stub-refresh-1",
    accessToken: null,
    accessTokenExpiresAt: null,
  });
  const b = await upsertAccount({
    userId: 1,
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

  await replaceWindow(a.id, 1, window, [
    mkEvent("a1", "Standup", 1, 9, 10),
    mkEvent("a2", "Design sync", 2, 13, 14),
    mkEvent("a3", "1:1 Sarah", 3, 11, 12),
  ]);
  await replaceWindow(b.id, 1, window, [
    mkEvent("b1", "CSE 599R", 1, 11, 13),
    mkEvent("b2", "LING 573", 2, 15, 17),
    mkEvent("b3", "Office hours", 4, 10, 11),
  ]);

  console.log(
    `Seeded 6 events across 2 accounts for week starting ${weekStart.toISOString()}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
