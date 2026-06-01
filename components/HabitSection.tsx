"use client";

import { useState, useTransition } from "react";
import { DAY_LABELS_KO } from "@/lib/week";
import {
  createHabit,
  toggleHabitDay,
  updateHabitTitle,
  deleteHabit,
} from "@/app/actions/habits";

export interface HabitData {
  id: string;
  title: string;
  type: "weekday" | "weekend";
  daysCompleted: number[];
}

interface Props {
  weekStartIso: string;
  habits: HabitData[];
}

const TYPE_DAYS: Record<HabitData["type"], number[]> = {
  weekday: [0, 1, 2, 3, 4], // 월-금
  weekend: [5, 6], // 토-일
};

const TYPE_LABEL: Record<HabitData["type"], string> = {
  weekday: "평일 습관",
  weekend: "주말 습관",
};

interface HabitCardProps {
  habit: HabitData;
}

function HabitCard({ habit }: HabitCardProps) {
  const days = TYPE_DAYS[habit.type];
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(habit.title);

  const completed = habit.daysCompleted.length;
  const total = days.length;
  const pct = (completed / total) * 100;

  function toggle(d: number) {
    startTransition(() => toggleHabitDay(habit.id, d).catch(() => {}));
  }

  function saveTitle() {
    if (!draft.trim() || draft === habit.title) {
      setEditing(false);
      setDraft(habit.title);
      return;
    }
    startTransition(() =>
      updateHabitTitle(habit.id, draft).then(() => setEditing(false)),
    );
  }

  function remove() {
    if (!confirm("이 습관을 삭제할까요?")) return;
    startTransition(() => deleteHabit(habit.id).catch(() => {}));
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          {TYPE_LABEL[habit.type]}
        </span>
        <span className="text-[10px] text-neutral-400">
          {completed}/{total}
        </span>
      </div>

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveTitle();
            if (e.key === "Escape") {
              setEditing(false);
              setDraft(habit.title);
            }
          }}
          className="mb-2 w-full rounded border border-neutral-300 px-2 py-1 text-sm focus:border-neutral-900 focus:outline-none"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="mb-2 block w-full truncate text-left text-sm font-semibold text-neutral-900 hover:text-neutral-600"
          title={habit.title}
        >
          {habit.title}
        </button>
      )}

      {/* 진행률 바 */}
      <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* 요일 체크박스 */}
      <div className="flex items-center justify-between gap-1">
        {days.map((d) => {
          const done = habit.daysCompleted.includes(d);
          return (
            <button
              key={d}
              onClick={() => toggle(d)}
              className={
                "flex h-9 flex-1 items-center justify-center rounded-md border text-xs font-semibold transition " +
                (done
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-400")
              }
              aria-label={`${DAY_LABELS_KO[d]}요일 ${done ? "완료" : "미완료"}`}
            >
              {done ? "✓" : DAY_LABELS_KO[d]}
            </button>
          );
        })}
        <button
          onClick={remove}
          className="ml-2 text-[10px] text-neutral-300 hover:text-red-500"
          aria-label="삭제"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

interface AddHabitButtonProps {
  type: "weekday" | "weekend";
  weekStartIso: string;
}

function AddHabitButton({ type, weekStartIso }: AddHabitButtonProps) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(() =>
      createHabit({ title, type, weekStart: weekStartIso })
        .then(() => {
          setTitle("");
          setAdding(false);
        })
        .catch(() => {}),
    );
  }

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className="flex h-full min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 text-sm text-neutral-400 transition hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
      >
        <span className="text-2xl">+</span>
        <span className="mt-1 text-xs">{TYPE_LABEL[type]} 추가</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex h-full min-h-[140px] flex-col rounded-xl border border-neutral-300 bg-white p-4 shadow-sm"
    >
      <span className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
        {TYPE_LABEL[type]}
      </span>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="예) 운동 30분"
        className="mb-3 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-900 focus:outline-none"
      />
      <div className="mt-auto flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
        >
          추가
        </button>
        <button
          type="button"
          onClick={() => {
            setAdding(false);
            setTitle("");
          }}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100"
        >
          취소
        </button>
      </div>
    </form>
  );
}

export function HabitSection({ weekStartIso, habits }: Props) {
  const weekday = habits.find((h) => h.type === "weekday") ?? null;
  const weekend = habits.find((h) => h.type === "weekend") ?? null;

  return (
    <section className="mb-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          이번 주 습관
        </h2>
        <span className="text-[10px] text-neutral-400">
          평일은 5번 · 주말은 2번
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {weekday ? (
          <HabitCard habit={weekday} />
        ) : (
          <AddHabitButton type="weekday" weekStartIso={weekStartIso} />
        )}
        {weekend ? (
          <HabitCard habit={weekend} />
        ) : (
          <AddHabitButton type="weekend" weekStartIso={weekStartIso} />
        )}
      </div>
    </section>
  );
}
