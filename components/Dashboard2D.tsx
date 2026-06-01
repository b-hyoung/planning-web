"use client";

import { DAY_LABELS_KO } from "@/lib/week";
import type { CardData } from "./CardItem";

interface Props {
  todayCard: CardData | null;
  weekCards: CardData[];
  onCardClick: (card: CardData) => void;
}

const TAG_LABEL: Record<string, string> = {
  work: "업무",
  personal: "개인",
};

const TAG_TONE: Record<string, { bar: string; chip: string }> = {
  work: { bar: "border-l-blue-500", chip: "bg-blue-100 text-blue-700" },
  personal: { bar: "border-l-green-500", chip: "bg-green-100 text-green-700" },
};

const COLUMN_LABEL: Record<string, string> = {
  todo: "할 일",
  doing: "진행 중",
  done: "완료",
};

export function Dashboard2D({ todayCard, weekCards, onCardClick }: Props) {
  const others = weekCards.filter((c) => c.id !== todayCard?.id);
  const todoList = others.filter((c) => c.column === "todo");
  const doingList = others.filter((c) => c.column === "doing");
  const doneList = others.filter((c) => c.column === "done");

  return (
    <div className="space-y-8">
      {/* 오늘 카드 큰 영역 */}
      <section>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          오늘
        </div>
        {todayCard ? (
          <button
            onClick={() => onCardClick(todayCard)}
            className={`block w-full rounded-3xl border-l-[10px] ${TAG_TONE[todayCard.tag]?.bar ?? "border-l-neutral-300"} bg-white p-8 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-xl`}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TAG_TONE[todayCard.tag]?.chip ?? "bg-neutral-100 text-neutral-600"}`}>
                {TAG_LABEL[todayCard.tag] ?? todayCard.tag}
              </span>
              {todayCard.dueDay !== null && (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                  마감 {DAY_LABELS_KO[todayCard.dueDay]}요일
                </span>
              )}
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                {COLUMN_LABEL[todayCard.column] ?? todayCard.column}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-neutral-900">{todayCard.title}</h2>
            {todayCard.memo && (
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-neutral-600">
                {todayCard.memo}
              </p>
            )}
            {todayCard.linkedIssue && (
              <p className="mt-4 text-sm text-neutral-500">
                🔗 연결 이슈: {todayCard.linkedIssue.title}
              </p>
            )}
          </button>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-10 text-center">
            <p className="text-base text-neutral-500">오늘 마감인 카드가 없어요.</p>
            <a
              href="/board"
              className="mt-3 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
            >
              보드에서 카드 추가
            </a>
          </div>
        )}
      </section>

      {/* 이번 주 나머지 카드 — 컬럼별 그룹 */}
      <section>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          이번 주 다른 카드
        </div>
        {others.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-400">
            다른 카드가 없어요.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {([
              ["todo", todoList],
              ["doing", doingList],
              ["done", doneList],
            ] as const).map(([key, list]) => (
              <div key={key}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-700">
                    {COLUMN_LABEL[key]}
                  </h3>
                  <span className="text-xs text-neutral-400">{list.length}</span>
                </div>
                <ul className="space-y-2">
                  {list.map((c) => {
                    const tone = TAG_TONE[c.tag];
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => onCardClick(c)}
                          className={`block w-full rounded-lg border border-neutral-200 border-l-4 ${tone?.bar ?? "border-l-neutral-300"} bg-white p-3 text-left text-sm shadow-sm transition hover:shadow ${c.column === "done" ? "opacity-60" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`font-medium ${c.column === "done" ? "line-through" : ""}`}>
                              {c.title}
                            </span>
                            {c.dueDay !== null && (
                              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${tone?.chip ?? "bg-neutral-100 text-neutral-600"}`}>
                                {DAY_LABELS_KO[c.dueDay]}
                              </span>
                            )}
                          </div>
                          {c.memo && (
                            <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                              {c.memo}
                            </p>
                          )}
                        </button>
                      </li>
                    );
                  })}
                  {list.length === 0 && (
                    <li className="rounded-lg border border-dashed border-neutral-200 px-3 py-4 text-center text-xs text-neutral-400">
                      없음
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
