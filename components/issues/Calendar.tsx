"use client";

import "react-day-picker/style.css";

import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import type { DayButtonProps } from "react-day-picker";
import { dateKey, getHoliday } from "@/lib/holidays";

export interface CalendarIssue {
  id: string;
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

const PRIORITY_COLOR: Record<CalendarIssue["priority"], string> = {
  high: "bg-red-500",
  med: "bg-amber-500",
  low: "bg-neutral-400",
};

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
    return map;
  }, [issues]);

  function CustomDayButton({ day, ...buttonProps }: DayButtonProps) {
    const date = day.date;
    const key = dateKey(date);
    const dayIssues = issuesByDate.get(key) ?? [];
    const visibleDots = dayIssues.slice(0, 3);
    const overflow = dayIssues.length - visibleDots.length;
    const holidayName = getHoliday(date);
    const dow = date.getDay(); // 0=Sun, 6=Sat

    // 한국식: 일요일 & 공휴일 = 빨강, 토요일 = 파랑
    let dayColorClass = "";
    if (holidayName || dow === 0) {
      dayColorClass = "text-red-600";
    } else if (dow === 6) {
      dayColorClass = "text-blue-600";
    }

    return (
      <button
        {...buttonProps}
        className={buttonProps.className}
        title={holidayName ?? undefined}
      >
        <span className={`flex flex-col items-center ${dayColorClass}`}>
          <span>{date.getDate()}</span>
          {dayIssues.length > 0 && (
            <span className="flex items-center justify-center gap-px mt-0.5">
              {visibleDots.map((issue) => {
                const colorClass = PRIORITY_COLOR[issue.priority];
                const opacityClass =
                  issue.status === "resolved" ? " opacity-30" : "";
                return (
                  <span
                    key={issue.id}
                    className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${colorClass}${opacityClass}`}
                    aria-hidden="true"
                  />
                );
              })}
              {overflow > 0 && (
                <span className="text-[9px] leading-none text-neutral-500 font-medium">
                  +{overflow}
                </span>
              )}
            </span>
          )}
        </span>
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
      components={{
        DayButton: CustomDayButton,
      }}
    />
  );
}
