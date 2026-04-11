import { describe, expect, it } from "vitest";
import { layoutDayEvents } from "@/lib/ui/day-layout";

function at(time: string) {
  return `2026-04-06T${time}:00.000Z`;
}

describe("layoutDayEvents", () => {
  it("places simultaneous events in separate columns", () => {
    const [lecture, meeting] = layoutDayEvents([
      { id: "lecture", start: at("17:00"), end: at("18:00") },
      { id: "meeting", start: at("17:15"), end: at("17:30") },
    ]);

    expect(lecture.column).toBe(0);
    expect(meeting.column).toBe(1);
    expect(lecture.columnCount).toBe(2);
    expect(meeting.columnCount).toBe(2);
  });

  it("keeps chained overlaps in one cluster and resets after gaps", () => {
    const [a, b, c, d] = layoutDayEvents([
      { id: "a", start: at("17:00"), end: at("18:00") },
      { id: "b", start: at("17:30"), end: at("19:00") },
      { id: "c", start: at("18:30"), end: at("20:00") },
      { id: "d", start: at("21:00"), end: at("22:00") },
    ]);

    expect([a.column, b.column, c.column, d.column]).toEqual([0, 1, 0, 0]);
    expect([a.columnCount, b.columnCount, c.columnCount, d.columnCount]).toEqual([
      2, 2, 2, 1,
    ]);
  });

  it("expands an event when columns to its right are free during its time", () => {
    const [, , , late] = layoutDayEvents([
      { id: "anchor", start: at("09:00"), end: at("12:00") },
      { id: "left", start: at("09:00"), end: at("10:00") },
      { id: "right", start: at("09:00"), end: at("10:00") },
      { id: "late", start: at("10:00"), end: at("11:00") },
    ]);

    expect(late.columnCount).toBe(3);
    expect(late.column).toBe(1);
    expect(late.span).toBe(2);
  });
});
