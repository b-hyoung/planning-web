"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, type CalendarIssue } from "@/components/issues/Calendar";
import { IssuesList, type IssueRow } from "@/components/issues/IssuesList";
import { IssueModal, type IssueData, type IssueFormCard } from "@/components/issues/IssueModal";
import { getHoliday } from "@/lib/holidays";

interface IssuePayload {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "med" | "high";
  status: "open" | "in_progress" | "resolved";
  reportedAtIso: string;
  cardId: string | null;
  cardTitle: string | null;
}

interface Props {
  monthIso: string;
  issues: IssuePayload[];
  cardOptions: IssueFormCard[];
}

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

const PRIORITY_DOT: Record<IssuePayload["priority"], string> = {
  high: "bg-red-500",
  med: "bg-amber-500",
  low: "bg-neutral-400",
};

const PRIORITY_LABEL: Record<IssuePayload["priority"], string> = {
  high: "높음",
  med: "보통",
  low: "낮음",
};

const STATUS_LABEL: Record<IssuePayload["status"], string> = {
  open: "열림",
  in_progress: "진행중",
  resolved: "해결",
};

function formatSelectedHeader(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dow = WEEKDAY_KO[d.getDay()];
  return `${m}월 ${day}일 (${dow})`;
}

export function IssuesClient({ monthIso, issues: initial, cardOptions }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const month = new Date(monthIso);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState<{ date: Date } | null>(null);

  const [issues, setIssues] = useState<IssuePayload[]>(initial);
  const prevInitial = useRef(initial);
  useEffect(() => {
    if (prevInitial.current !== initial) {
      prevInitial.current = initial;
      setIssues(initial);
    }
  }, [initial]);

  const calendarIssues: CalendarIssue[] = useMemo(
    () =>
      issues.map((i) => ({
        id: i.id,
        title: i.title,
        reportedAt: new Date(i.reportedAtIso),
        priority: i.priority,
        status: i.status,
      })),
    [issues]
  );

  const selectedDayIssues = useMemo(() => {
    if (!selectedDate) return [];
    return issues.filter(
      (i) => new Date(i.reportedAtIso).toDateString() === selectedDate.toDateString()
    );
  }, [issues, selectedDate]);

  const monthListIssues: IssueRow[] = useMemo(
    () =>
      issues.map((i) => ({
        id: i.id,
        title: i.title,
        priority: i.priority,
        status: i.status,
        reportedAt: new Date(i.reportedAtIso),
        cardTitle: i.cardTitle,
      })),
    [issues]
  );

  function changeMonth(d: Date) {
    const next = new URLSearchParams(params.toString());
    next.set("m", `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    router.push(`/issues?${next.toString()}`);
  }

  function modalIssue(): IssueData | null {
    if (!editingId) return null;
    const i = issues.find((x) => x.id === editingId);
    if (!i) return null;
    return {
      id: i.id,
      title: i.title,
      description: i.description,
      priority: i.priority,
      status: i.status,
      reportedAt: new Date(i.reportedAtIso),
      cardId: i.cardId,
    };
  }

  const holidayName = selectedDate ? getHoliday(selectedDate) : null;
  const isWeekend = selectedDate
    ? selectedDate.getDay() === 0 || selectedDate.getDay() === 6
    : false;
  const selectedHeaderColor =
    selectedDate && (holidayName || selectedDate.getDay() === 0)
      ? "text-red-600"
      : selectedDate && selectedDate.getDay() === 6
      ? "text-blue-600"
      : "text-neutral-900";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">이슈</h1>
        <button
          onClick={() => setCreating({ date: selectedDate ?? new Date() })}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800"
        >
          + 새 이슈
        </button>
      </div>

      {/* 메인 영역: 좌측 캘린더 + 우측 사이드패널 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* 좌측: 캘린더 */}
        <Calendar
          month={month}
          onMonthChange={changeMonth}
          issues={calendarIssues}
          selected={selectedDate}
          onSelect={(d) => setSelectedDate(d)}
        />

        {/* 우측: 선택된 날짜 + 이번 달 전체 (스크롤) */}
        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:pr-1">
          {/* 선택된 날짜 섹션 */}
          {selectedDate ? (
            <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2 min-w-0">
                  <h2 className={`text-lg font-bold ${selectedHeaderColor}`}>
                    {formatSelectedHeader(selectedDate)}
                  </h2>
                  {holidayName && (
                    <span className="truncate rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
                      {holidayName}
                    </span>
                  )}
                  {!holidayName && isWeekend && (
                    <span className="text-[10px] text-neutral-400">주말</span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="shrink-0 text-[10px] text-neutral-400 hover:text-neutral-700"
                  aria-label="선택 해제"
                >
                  ✕
                </button>
              </div>

              <button
                onClick={() => setCreating({ date: selectedDate })}
                className="mb-3 w-full rounded-md border border-dashed border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-500 hover:border-neutral-500 hover:text-neutral-900"
              >
                + 이 날 이슈 추가
              </button>

              {selectedDayIssues.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 px-3 py-8 text-center text-xs text-neutral-400">
                  이 날 등록된 이슈가 없어요
                </div>
              ) : (
                <ul className="space-y-2">
                  {selectedDayIssues.map((i) => (
                    <li
                      key={i.id}
                      onClick={() => setEditingId(i.id)}
                      className={
                        "cursor-pointer rounded-lg border border-neutral-200 bg-white p-3 transition hover:border-neutral-400 hover:shadow-sm " +
                        (i.status === "resolved" ? "opacity-50" : "")
                      }
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[i.priority]}`}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-1.5">
                            <h3 className="text-sm font-semibold truncate">{i.title}</h3>
                            <span
                              className={
                                "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium " +
                                (i.status === "resolved"
                                  ? "bg-neutral-100 text-neutral-500"
                                  : i.status === "in_progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700")
                              }
                            >
                              {STATUS_LABEL[i.status]}
                            </span>
                          </div>
                          {i.description && (
                            <p className="mt-1 text-xs text-neutral-600 line-clamp-2">
                              {i.description}
                            </p>
                          )}
                          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-neutral-400">
                            <span>우선순위 {PRIORITY_LABEL[i.priority]}</span>
                            {i.cardTitle && (
                              <>
                                <span>·</span>
                                <span className="truncate">🔗 {i.cardTitle}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : (
            <section className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-4 text-center text-xs text-neutral-500">
              날짜를 클릭하면 그 날 이슈를 여기에 자세히 표시
            </section>
          )}

          {/* 이번 달 전체 목록 */}
          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase text-neutral-500">
              이번 달 전체
            </h3>
            <IssuesList issues={monthListIssues} onSelect={(id) => setEditingId(id)} />
          </section>
        </aside>
      </div>

      <IssueModal
        open={!!editingId || !!creating}
        initial={modalIssue()}
        defaultDate={creating?.date}
        cardOptions={cardOptions}
        onClose={() => {
          setEditingId(null);
          setCreating(null);
        }}
      />
    </div>
  );
}
