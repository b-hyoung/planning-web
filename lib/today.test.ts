import { describe, it, expect } from "vitest";
import { pickTodayCard, type CardForToday } from "./today";

const base: Omit<CardForToday, "id" | "column"> = {
  title: "x",
  tag: "work",
  dueDay: null,
};

describe("pickTodayCard", () => {
  it("returns null when no cards", () => {
    expect(pickTodayCard([])).toBeNull();
  });

  it("returns first 'doing' card (doing = today's task)", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, column: "todo" },
      { id: "2", ...base, column: "doing" },
      { id: "3", ...base, column: "doing" },
    ];
    expect(pickTodayCard(cards)?.id).toBe("2");
  });

  it("falls back to first 'todo' when no doing", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, column: "done" },
      { id: "2", ...base, column: "todo" },
      { id: "3", ...base, column: "todo" },
    ];
    expect(pickTodayCard(cards)?.id).toBe("2");
  });

  it("returns null when only 'done' cards exist", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, column: "done" },
      { id: "2", ...base, column: "done" },
    ];
    expect(pickTodayCard(cards)).toBeNull();
  });

  it("ignores dueDay (doing column wins regardless)", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, dueDay: 3, column: "todo" },
      { id: "2", ...base, dueDay: null, column: "doing" },
    ];
    expect(pickTodayCard(cards)?.id).toBe("2");
  });
});
