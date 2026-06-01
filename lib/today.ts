export interface CardForToday {
  id: string;
  title: string;
  tag: string;
  dueDay: number | null;
  column: string;
}

/**
 * 오늘 카드 (메인의 중앙 카드) 선정.
 * "진행 중(doing)" 컬럼 = "오늘 할 일" 이라는 컨벤션이므로:
 *   1) doing 첫 카드 (위치순)
 *   2) 없으면 todo 첫 카드
 *   3) 없으면 null
 *
 * todayWeekday 인자는 현재 사용하지 않지만 API 호환을 위해 보존.
 */
export function pickTodayCard<T extends CardForToday>(
  cards: T[],
  _todayWeekday?: number,
): T | null {
  if (cards.length === 0) return null;

  const doing = cards.find((c) => c.column === "doing");
  if (doing) return doing;

  const todo = cards.find((c) => c.column === "todo");
  if (todo) return todo;

  return null;
}

/** 0=Mon ... 6=Sun (참고용 — 더 이상 pickTodayCard 에 영향 주지 않음) */
export function todayWeekday(now: Date = new Date()): number {
  const jsDay = now.getDay();
  return (jsDay + 6) % 7;
}
