import { defaultWindow } from "@/lib/sync/sync-user";

describe("defaultWindow", () => {
  it("returns the current and next week starting at sunday midnight", () => {
    const { start, end } = defaultWindow(new Date("2026-04-08T15:45:00.000Z"));

    expect(start.toISOString()).toBe("2026-04-05T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-04-19T00:00:00.000Z");
  });
});
