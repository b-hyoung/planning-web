"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, type CalendarIssue } from "@/components/issues/Calendar";
import { IssuesList, type IssueRow } from "@/components/issues/IssuesList";
import { IssueModal, type IssueData, type IssueFormCard } from "@/components/issues/IssueModal";

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
        reportedAt: new Date(i.reportedAtIso),
        priority: i.priority,
        status: i.status,
      })),
    [issues]
  );

  const listIssues: IssueRow[] = useMemo(
    () =>
      issues
        .filter((i) =>
          selectedDate
            ? new Date(i.reportedAtIso).toDateString() === selectedDate.toDateString()
            : true
        )
        .map((i) => ({
          id: i.id,
          title: i.title,
          priority: i.priority,
          status: i.status,
          reportedAt: new Date(i.reportedAtIso),
          cardTitle: i.cardTitle,
        })),
    [issues, selectedDate]
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">이슈</h1>
        <button
          onClick={() => setCreating({ date: selectedDate ?? new Date() })}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800"
        >
          + 새 이슈
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
        <Calendar
          month={month}
          onMonthChange={changeMonth}
          issues={calendarIssues}
          selected={selectedDate}
          onSelect={(d) => setSelectedDate(d)}
        />
        <div className="space-y-3">
          {selectedDate && (
            <div className="text-xs text-neutral-500">
              선택일: {selectedDate.toLocaleDateString("ko-KR")}
              <button
                onClick={() => setSelectedDate(null)}
                className="ml-2 text-neutral-400 hover:text-neutral-700"
              >
                (해제)
              </button>
            </div>
          )}
          <IssuesList issues={listIssues} onSelect={(id) => setEditingId(id)} />
        </div>
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
