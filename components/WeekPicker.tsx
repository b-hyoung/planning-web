"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  addWeeks,
  formatWeekLabel,
  parseWeekParam,
  toWeekParam,
  getWeekStart,
} from "@/lib/week";

export function WeekPicker() {
  const router = useRouter();
  const params = useSearchParams();
  const current = parseWeekParam(params.get("week")) ?? getWeekStart(new Date());

  function go(weekStart: Date) {
    const next = new URLSearchParams(params.toString());
    next.set("week", toWeekParam(weekStart));
    router.push(`/board?${next.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(addWeeks(current, -1))}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-100"
        aria-label="이전 주"
      >
        ←
      </button>
      <button
        onClick={() => go(getWeekStart(new Date()))}
        className="rounded-md border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
      >
        이번 주
      </button>
      <button
        onClick={() => go(addWeeks(current, 1))}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-100"
        aria-label="다음 주"
      >
        →
      </button>
      <span className="ml-3 text-base font-medium">{formatWeekLabel(current)}</span>
    </div>
  );
}
