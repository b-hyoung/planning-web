"use client";

import Link from "next/link";
import { useState } from "react";
import { DAY_LABELS_KO } from "@/lib/week";
import type { CardData } from "./CardItem";

interface Props {
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

interface SectionCardProps {
  card: CardData;
  big?: boolean;
  onClick: () => void;
}

function SectionCard({ card, big = false, onClick }: SectionCardProps) {
  const tone = TAG_TONE[card.tag];
  const padding = big ? "p-6" : "p-4";
  const titleSize = big ? "text-xl font-bold" : "text-base font-semibold";
  const memoSize = big ? "text-sm" : "text-xs";
  const barW = big ? "border-l-[8px]" : "border-l-4";
  return (
    <button
      onClick={onClick}
      className={`block w-full rounded-xl border border-neutral-200 ${barW} ${tone?.bar ?? "border-l-neutral-300"} bg-white ${padding} text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${card.column === "done" ? "opacity-60" : ""}`}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tone?.chip ?? "bg-neutral-100 text-neutral-600"}`}>
          {TAG_LABEL[card.tag] ?? card.tag}
        </span>
        {card.dueDay !== null && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600">
            마감 {DAY_LABELS_KO[card.dueDay]}
          </span>
        )}
      </div>
      <div className={`${titleSize} text-neutral-900 ${card.column === "done" ? "line-through" : ""}`}>
        {card.title}
      </div>
      {card.memo && (
        <p className={`mt-2 whitespace-pre-line ${memoSize} leading-relaxed text-neutral-600 line-clamp-3`}>
          {card.memo}
        </p>
      )}
      {card.linkedIssue && (
        <p className="mt-2 text-[11px] text-neutral-500">
          🔗 {card.linkedIssue.title}
        </p>
      )}
    </button>
  );
}

export function Dashboard2D({ weekCards, onCardClick }: Props) {
  const doingCards = weekCards.filter((c) => c.column === "doing");
  const todoCards = weekCards.filter((c) => c.column === "todo");
  const doneCards = weekCards.filter((c) => c.column === "done");
  const [showDone, setShowDone] = useState(false);

  return (
    <div className="space-y-8">
      {/* 오늘 할 일 (doing 컬럼) */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            오늘 할 일
          </h2>
          <span className="text-xs text-neutral-400">{doingCards.length}개</span>
        </div>
        {doingCards.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-10 text-center">
            <p className="text-base text-neutral-500">오늘 할 일이 없어요.</p>
            <Link
              href="/board"
              className="mt-3 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
            >
              보드에서 카드를 오늘 할 일로 옮기기
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {doingCards.map((c, i) => (
              <li key={c.id}>
                <SectionCard card={c} big={i === 0} onClick={() => onCardClick(c)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 이번 주 할 일 (todo 컬럼) */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            이번 주 할 일
          </h2>
          <span className="text-xs text-neutral-400">{todoCards.length}개</span>
        </div>
        {todoCards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-sm text-neutral-400">
            이번 주 할 일이 없어요.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {todoCards.map((c) => (
              <SectionCard key={c.id} card={c} onClick={() => onCardClick(c)} />
            ))}
          </div>
        )}
      </section>

      {/* 완료 (접힘) */}
      {doneCards.length > 0 && (
        <section>
          <button
            onClick={() => setShowDone(!showDone)}
            className="mb-2 flex w-full items-center justify-between text-left"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              완료 <span className="ml-1 text-neutral-400">({doneCards.length}개)</span>
            </h2>
            <span className="text-xs text-neutral-400">{showDone ? "▲" : "▼"}</span>
          </button>
          {showDone && (
            <ul className="space-y-2">
              {doneCards.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onCardClick(c)}
                    className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm opacity-60 hover:opacity-80"
                  >
                    <span className="line-through text-neutral-700">{c.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
