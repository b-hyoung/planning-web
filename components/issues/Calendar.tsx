"use client";

import "react-day-picker/style.css";

import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import type { DayButtonProps } from "react-day-picker";

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

/** yyyy-mm-dd key from a Date */
function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Calendar({
  month,
  onMonthChange,
  issues,
  selected,
  onSelect,
}: Props) {
  // Group issues by date key
  const issuesByDate = useMemo(() => {
    const map = new Map<string, CalendarIssue[]>();
    for (const issue of issues) {
      const key = toKey(issue.reportedAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(issue);
    }
    return map;
  }, [issues]);

  function CustomDayButton({ day, modifiers, ...buttonProps }: DayButtonProps) {
    const key = toKey(day.date);
    const dayIssues = issuesByDate.get(key) ?? [];
    const visibleDots = dayIssues.slice(0, 3);
    const overflow = dayIssues.length - visibleDots.length;

    return (
      <button {...buttonProps} className={buttonProps.className}>
        {/* Day number rendered by the default button children */}
        {buttonProps.children}
        {/* Dot indicators */}
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
      showOutsideDays
      components={{
        DayButton: CustomDayButton,
      }}
    />
  );
}
