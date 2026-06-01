export function getWeekStart(date: Date): Date {
  const d = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  const day = d.getUTCDay(); // 0=Sun ... 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function addWeeks(weekStart: Date, weeks: number): Date {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return d;
}

export function formatWeekLabel(weekStart: Date): string {
  const y = weekStart.getUTCFullYear();
  const m = weekStart.getUTCMonth() + 1;
  const d = weekStart.getUTCDate();
  return `${y}년 ${m}월 ${d}일 주`;
}

export function parseWeekParam(param: string | undefined | null): Date | null {
  if (!param) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(param);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (isNaN(date.getTime())) return null;
  return getWeekStart(date);
}

export function toWeekParam(weekStart: Date): string {
  const y = weekStart.getUTCFullYear();
  const m = String(weekStart.getUTCMonth() + 1).padStart(2, "0");
  const d = String(weekStart.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const DAY_LABELS_KO = ["월", "화", "수", "목", "금", "토", "일"];
