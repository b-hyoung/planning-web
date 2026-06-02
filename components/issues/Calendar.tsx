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

// Notion 스타일 — 좌측 강한 색바 + 흐린 배경, 본문은 검정에 가깝게
const PRIORITY: Record<
  CalendarIssue["priority"],
  { bar: string; bg: string; text: string }
> = {
  high: { bar: "bg-red-500",    bg: "bg-red-50/70",    text: "text-red-900" },
  med:  { bar: "bg-amber-500",  bg: "bg-amber-50/70",  text: "text-amber-900" },
  low:  { bar: "bg-neutral-400", bg: "bg-neutral-100",  text: "text-neutral-700" },
};

const MAX_VISIBLE = 3;

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
    const rank: Record<CalendarIssue["priority"], number> = { high: 0, med: 1, low: 2 };
    for (const arr of map.values()) {
      arr.sort((a, b) => rank[a.priority] - rank[b.priority]);
    }
    return map;
  }, [issues]);

  const todayStart = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }, []);

  function CustomDayButton({
    day,
    modifiers,
    className: _ignored,
    style: _ignored2,
    ...buttonProps
  }: DayButtonProps) {
    const date = day.date;
    const key = dateKey(date);
    const dayIssues = issuesByDate.get(key) ?? [];
    const visible = dayIssues.slice(0, MAX_VISIBLE);
    const overflow = dayIssues.length - visible.length;
    const holidayName = getHoliday(date);
    const dow = date.getDay();
    const isPast = date.getTime() < todayStart;
    const isSelected = !!modifiers?.selected;
    const isToday = !!modifiers?.today;

    // 한국식 색
    let dayNumberColor = "text-neutral-700";
    if (holidayName || dow === 0) dayNumberColor = "text-red-500";
    else if (dow === 6) dayNumberColor = "text-blue-500";

    // 오늘일 때만 흰 텍스트 (배지 안쪽)
    const todayBadgeClass = isToday
      ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white font-semibold"
      : "";

    const cellClasses = [
      "block h-full w-full p-1.5 text-left transition-colors cursor-pointer",
      "border-r border-b border-neutral-100", // Notion 스타일 얇은 그리드선
      isSelected ? "bg-blue-50/60" : "hover:bg-neutral-50/80",
      isPast ? "bg-neutral-50/40" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        {...buttonProps}
        className={cellClasses}
        title={holidayName ?? undefined}
        style={isPast && !isSelected ? { opacity: 0.6 } : undefined}
      >
        <div className="flex h-full w-full flex-col gap-1">
          {/* 상단: 날짜 번호 + 휴일이름 */}
          <div className="flex items-center justify-between gap-1">
            <span
              className={
                isToday
                  ? `${todayBadgeClass} text-[11px]`
                  : `text-[11px] font-medium ${dayNumberColor}`
              }
            >
              {date.getDate()}
            </span>
            {holidayName && !isToday && (
              <span className="truncate text-[9px] font-normal text-red-400">
                {holidayName.length > 5 ? holidayName.slice(0, 5) + "…" : holidayName}
              </span>
            )}
          </div>

          {/* 이슈 미니 칩 */}
          {visible.length > 0 && (
            <div className="flex flex-col gap-[3px]">
              {visible.map((issue) => {
                const resolved = issue.status === "resolved";
                const p = PRIORITY[issue.priority];
                return (
                  <div
                    key={issue.id}
                    className={`flex items-center gap-1 overflow-hidden rounded ${p.bg} pl-[3px] pr-1 py-[1px] ${resolved ? "opacity-40" : ""}`}
                  >
                    <span
                      className={`h-2.5 w-[2px] shrink-0 rounded-full ${p.bar}`}
                      aria-hidden
                    />
                    <span
                      className={`min-w-0 flex-1 truncate text-[10px] leading-tight font-medium ${p.text} ${resolved ? "line-through" : ""}`}
                    >
                      {issue.title}
                    </span>
                  </div>
                );
              })}
              {overflow > 0 && (
                <span className="pl-1 text-[9px] font-medium text-neutral-400">
                  +{overflow}
                </span>
              )}
            </div>
          )}
        </div>
      </button>
    );
  }

  // 커스텀 네비게이션
  const monthTitle = `${month.getFullYear()}년 ${month.getMonth() + 1}월`;
  function goPrev() {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  }
  function goNext() {
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1));
  }
  function goToday() {
    const d = new Date();
    onMonthChange(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  return (
    <div className="rdp-notion-wrap rounded-lg border border-neutral-200 bg-white overflow-hidden">
      {/* 커스텀 헤더 */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <h2 className="text-base font-semibold">{monthTitle}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            className="rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100"
            aria-label="이전 달"
          >
            ←
          </button>
          <button
            onClick={goToday}
            className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
          >
            오늘
          </button>
          <button
            onClick={goNext}
            className="rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100"
            aria-label="다음 달"
          >
            →
          </button>
        </div>
      </div>
      {/* DayPicker 자체 보더/패딩 잡아두기 + 셀 균등화 */}
      <style>{`
        /* RDP v10 기본 변수/제약 무력화 — 셀이 컨테이너 폭을 균등하게 채우도록 */
        .rdp-notion-wrap .rdp-root {
          --rdp-day-width: auto;
          --rdp-day-height: 96px;
          --rdp-day_button-width: 100%;
          --rdp-day_button-height: 96px;
          --rdp-day_button-border-radius: 0;
          --rdp-day_button-border: 0;
          --rdp-accent-color: transparent;
          --rdp-weekday-padding: 8px 0;
          width: 100%;
        }
        .rdp-notion-wrap .rdp-months {
          margin: 0;
          max-width: none;  /* 기본 fit-content 해제 */
          width: 100%;
        }
        .rdp-notion-wrap .rdp-month {
          width: 100%;
        }
        /* 기본 캡션/네비 숨김 (위에 커스텀 헤더 따로 둠) */
        .rdp-notion-wrap .rdp-month_caption,
        .rdp-notion-wrap .rdp-nav { display: none !important; }

        /* 헤더 (요일) */
        .rdp-notion-wrap .rdp-weekday {
          padding: 8px 0;
          font-size: 11px;
          font-weight: 500;
          color: #737373;
          text-transform: none;
          border-bottom: 1px solid #e5e5e5;
          background: #fafafa;
          width: calc(100% / 7);
          box-sizing: border-box;
        }

        /* 본문 그리드 — 균등폭 강제 */
        .rdp-notion-wrap .rdp-month_grid,
        .rdp-notion-wrap table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }

        /* 모든 td (날짜 칸) — 빈 외부날짜 셀도 동일 크기 */
        .rdp-notion-wrap td {
          padding: 0;
          height: 96px;
          width: calc(100% / 7);
          vertical-align: top;
          overflow: hidden;
          box-sizing: border-box;
        }

        /* 버튼 — 셀 가득 채우고 동그라미/테두리 제거 */
        .rdp-notion-wrap .rdp-day_button {
          width: 100% !important;
          height: 96px !important;
          padding: 0 !important;
          border-radius: 0 !important;
          border: 0 !important;
          overflow: hidden;
          box-sizing: border-box;
          display: block;
        }

        /* 빈 외부날짜 셀 (showOutsideDays=false 때) — 회색 빈칸으로 */
        .rdp-notion-wrap td.rdp-outside,
        .rdp-notion-wrap td:empty {
          background: #fafafa;
          border-right: 1px solid #f5f5f5;
          border-bottom: 1px solid #f5f5f5;
        }
      `}</style>
      <DayPicker
        mode="single"
        month={month}
        onMonthChange={onMonthChange}
        selected={selected ?? undefined}
        onSelect={(d) => {
          if (d) onSelect(d);
        }}
        weekStartsOn={0}
        showOutsideDays={false}
        fixedWeeks
        components={{
          DayButton: CustomDayButton,
        }}
      />
    </div>
  );
}
