import { describe, it, expect } from "vitest";
import { getWeekStart, formatWeekLabel, addWeeks, parseWeekParam } from "./week";

describe("getWeekStart", () => {
  it("returns Monday 00:00 for a Wednesday", () => {
    // Wednesday June 3, 2026
    const d = new Date("2026-06-03T15:30:00Z");
    const start = getWeekStart(d);
    expect(start.toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });

  it("returns the same day for a Monday at midnight", () => {
    const d = new Date("2026-06-01T00:00:00Z");
    expect(getWeekStart(d).toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });

  it("rolls back across month boundary", () => {
    // Tuesday Sep 1, 2026 → Monday Aug 31
    const d = new Date("2026-09-01T10:00:00Z");
    expect(getWeekStart(d).toISOString()).toBe("2026-08-31T00:00:00.000Z");
  });

  it("treats Sunday as the last day of the previous Monday-week", () => {
    // Sunday June 7, 2026 → Monday June 1
    const d = new Date("2026-06-07T20:00:00Z");
    expect(getWeekStart(d).toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });
});

describe("addWeeks", () => {
  it("moves forward 1 week", () => {
    const d = new Date("2026-06-01T00:00:00Z");
    expect(addWeeks(d, 1).toISOString()).toBe("2026-06-08T00:00:00.000Z");
  });

  it("moves back 2 weeks", () => {
    const d = new Date("2026-06-15T00:00:00Z");
    expect(addWeeks(d, -2).toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });
});

describe("formatWeekLabel", () => {
  it("returns 'M월 D일 주' style label", () => {
    const d = new Date("2026-06-01T00:00:00Z");
    expect(formatWeekLabel(d)).toBe("2026년 6월 1일 주");
  });
});

describe("parseWeekParam", () => {
  it("returns weekStart for a valid ISO date string", () => {
    expect(parseWeekParam("2026-06-03")?.toISOString()).toBe(
      "2026-06-01T00:00:00.000Z"
    );
  });

  it("returns null for invalid input", () => {
    expect(parseWeekParam("not-a-date")).toBeNull();
    expect(parseWeekParam(undefined)).toBeNull();
  });
});
