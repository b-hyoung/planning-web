import { describe, it, expect } from "vitest";
import { pickTodayCard, type CardForToday } from "./today";

const base: Omit<CardForToday, "id" | "dueDay" | "column"> = {
  title: "x",
  tag: "work",
};

describe("pickTodayCard", () => {
  it("returns null when no cards", () => {
    expect(pickTodayCard([], 0)).toBeNull();
  });

  it("prefers a 'doing' card whose dueDay matches today", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, dueDay: 2, column: "doing" },
      { id: "2", ...base, dueDay: 0, column: "doing" },
      { id: "3", ...base, dueDay: 0, column: "todo" },
    ];
    expect(pickTodayCard(cards, 0)?.id).toBe("2");
  });

  it("falls back to 'todo' card matching today when no doing match", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, dueDay: 2, column: "doing" },
      { id: "2", ...base, dueDay: 0, column: "todo" },
    ];
    expect(pickTodayCard(cards, 0)?.id).toBe("2");
  });

  it("falls back to the card with closest dueDay if no today match", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, dueDay: 4, column: "todo" },
      { id: "2", ...base, dueDay: 2, column: "todo" },
      { id: "3", ...base, dueDay: 6, column: "doing" },
    ];
    expect(pickTodayCard(cards, 0)?.id).toBe("2");
  });

  it("ignores 'done' cards", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, dueDay: 0, column: "done" },
      { id: "2", ...base, dueDay: 0, column: "todo" },
    ];
    expect(pickTodayCard(cards, 0)?.id).toBe("2");
  });

  it("ignores cards with null dueDay when computing closest", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, dueDay: null, column: "todo" },
      { id: "2", ...base, dueDay: 3, column: "todo" },
    ];
    expect(pickTodayCard(cards, 0)?.id).toBe("2");
  });
});
