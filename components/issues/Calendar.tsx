"use client";

import "react-day-picker/style.css";

import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import type { DayButtonProps } from "react-day-picker";
import { dateKey, getHoliday } from "@/lib/holidays";

export interface CalendarIssue {
  id: string;
  title: string;
  reportedAt: Date;
  priority: "low" | "med" | "high";
  status: "open" | "in_progress" | "resolved";
}

interface Props {
  month: Date;
  onMonthChange: (d: Date) => void;
  issues: CalendarIssue[];
  selected: Date | null;
  onSelect: (d: Date) => void;
}

// 우선순위별 좌측 바 색 (Google Calendar 스타일)
const PRIORITY_BAR: Record<CalendarIssue["priority"], string> = {
  high: "bg-red-500",
  med: "bg-amber-500",
  low: "bg-neutral-400",
};

const PRIORITY_BG: Record<CalendarIssue["priority"], string> = {
  high: "bg-red-50 text-red-800",
  med: "bg-amber-50 text-amber-800",
  low: "bg-neutral-100 text-neutral-700",
};

const MAX_VISIBLE = 3; // 한 셀에 최대 보이는 이슈 수

export function Calendar({
  month,
  onMonthChange,
  issues,
  selected,
  onSelect,
}: Props) {
  const issuesByDate = useMemo(() => {
    const map = new Map<string, CalendarIssue[]>();
    for (const issue of issues) {
      const key = dateKey(issue.reportedAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(issue);
    }
    // 우선순위 high → low 순으로 정렬해서 중요한 게 먼저 보이게
    const rank: Record<CalendarIssue["priority"], number> = { high: 0, med: 1, low: 2 };
    for (const arr of map.values()) {
      arr.sort((a, b) => rank[a.priority] - rank[b.priority]);
    }
    return map;
  }, [issues]);

  // 오늘 자정 (로컬 시각 기준) — 이 시점보다 이전은 "지난날"
  const todayStart = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }, []);

  function CustomDayButton({ day, ...buttonProps }: DayButtonProps) {
    const date = day.date;
    const key = dateKey(date);
    const dayIssues = issuesByDate.get(key) ?? [];
    const visible = dayIssues.slice(0, MAX_VISIBLE);
    const overflow = dayIssues.length - visible.length;
    const holidayName = getHoliday(date);
    const dow = date.getDay(); // 0=Sun, 6=Sat
    const isPast = date.getTime() < todayStart;

    // 한국식: 일요일 & 공휴일 = 빨강, 토요일 = 파랑
    let dayNumberColor = "text-neutral-800";
    if (holidayName || dow === 0) dayNumberColor = "text-red-600";
    else if (dow === 6) dayNumberColor = "text-blue-600";

    return (
      <button
        {...buttonProps}
        className={`${buttonProps.className ?? ""} !p-1 !h-auto !min-h-[88px] !w-full !items-start !justify-start !text-left ${isPast ? "!bg-neutral-50" : ""}`}
        title={holidayName ?? undefined}
        style={isPast ? { opacity: 0.55 } : undefined}
      >
        <div className="flex w-full flex-col gap-0.5">
          {/* 날짜 번호 + 휴일 이름 */}
          <div className="flex items-baseline justify-between gap-1">
            <span className={`text-xs font-semibold ${dayNumberColor}`}>
              {date.getDate()}
            </span>
            {holidayName && (
              <span className="truncate text-[9px] font-medium text-red-500">
                {holidayName.length > 6 ? holidayName.slice(0, 6) + "…" : holidayName}
              </span>
            )}
          </div>

          {/* 이슈 미니 바 */}
          {visible.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {visible.map((issue) => {
                const resolved = issue.status === "resolved";
                const bg = PRIORITY_BG[issue.priority];
                const bar = PRIORITY_BAR[issue.priority];
                return (
                  <div
                    key={issue.id}
                    className={`flex items-center gap-1 overflow-hidden rounded-sm ${bg} pr-1 ${resolved ? "opacity-40" : ""}`}
                  >
                    <span className={`h-3 w-0.5 shrink-0 rounded-full ${bar}`} aria-hidden />
                    <span
                      className={`truncate text-[9px] leading-tight font-medium ${resolved ? "line-through" : ""}`}
                    >
                      {issue.title}
                    </span>
                  </div>
                );
              })}
              {overflow > 0 && (
                <span className="pl-1 text-[9px] font-medium text-neutral-500">
                  +{overflow}개 더
                </span>
              )}
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <DayPicker
      mode="single"
      month={month}
      onMonthChange={onMonthChange}
      selected={selected ?? undefined}
      onSelect={(d) => {
        if (d) onSelect(d);
      }}
      weekStartsOn={1}
      showOutsideDays={false}
      fixedWeeks
      components={{
        DayButton: CustomDayButton,
      }}
    />
  );
}
