export interface CardForToday {
  id: string;
  title: string;
  tag: string;
  dueDay: number | null;
  column: string;
}

export function pickTodayCard<T extends CardForToday>(
  cards: T[],
  todayWeekday: number,
): T | null {
  if (cards.length === 0) return null;

  const active = cards.filter((c) => c.column !== "done");
  if (active.length === 0) return null;

  const matchToday = active.filter((c) => c.dueDay === todayWeekday);

  const doingToday = matchToday.find((c) => c.column === "doing");
  if (doingToday) return doingToday;

  const todoToday = matchToday.find((c) => c.column === "todo");
  if (todoToday) return todoToday;

  let best: T | null = null;
  let bestDist = Infinity;
  for (const c of active) {
    if (c.dueDay === null) continue;
    const dist = Math.abs(c.dueDay - todayWeekday);
    if (dist < bestDist) {
      best = c;
      bestDist = dist;
    }
  }
  return best;
}

export function todayWeekday(now: Date = new Date()): number {
  const jsDay = now.getDay();
  return (jsDay + 6) % 7;
}
