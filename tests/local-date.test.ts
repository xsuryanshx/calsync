import { describe, expect, it } from "vitest";
import { formatLocalDateKey, parseLocalDateKey } from "@/lib/time/local-date";

describe("local date keys", () => {
  it("round-trips a local calendar date without shifting the day", () => {
    const original = new Date(2026, 3, 5, 0, 0, 0, 0);
    const key = formatLocalDateKey(original);
    const parsed = parseLocalDateKey(key);

    expect(key).toBe("2026-04-05");
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(3);
    expect(parsed.getDate()).toBe(5);
  });
});
