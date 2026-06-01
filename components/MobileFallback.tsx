"use client";

import Link from "next/link";
import type { CardData } from "./CardItem";

interface Props {
  todayCard: CardData | null;
  weekCards: CardData[];
}

export function MobileFallback({ todayCard, weekCards }: Props) {
  return (
    <div className="space-y-5">
      <section>
        <div className="text-xs font-semibold uppercase text-neutral-500">오늘</div>
        {todayCard ? (
          <Link
            href="/board"
            className="mt-2 block rounded-2xl border border-neutral-200 bg-white p-5 shadow"
          >
            <div className="text-lg font-semibold">{todayCard.title}</div>
            {todayCard.memo && <p className="mt-2 text-sm text-neutral-600">{todayCard.memo}</p>}
          </Link>
        ) : (
          <div className="mt-2 rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500">
            오늘 마감인 카드가 없어요. <Link href="/board" className="underline">보드</Link> 에서 추가하세요.
          </div>
        )}
      </section>
      <section>
        <div className="text-xs font-semibold uppercase text-neutral-500">이번 주</div>
        <ul className="mt-2 space-y-1.5">
          {weekCards
            .filter((c) => c.column !== "done")
            .map((c) => (
              <li key={c.id}>
                <Link
                  href="/board"
                  className="block rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                >
                  {c.title}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
