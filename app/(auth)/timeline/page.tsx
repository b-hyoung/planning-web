import Link from "next/link";
import { prisma } from "@/lib/db";

type TagFilter = "work" | "personal" | "all";

const TAG_STYLES: Record<string, string> = {
  work: "border-l-blue-500",
  personal: "border-l-green-500",
};

const TAG_LABELS: Record<string, string> = {
  work: "업무",
  personal: "개인",
};

const FILTER_OPTIONS: { value: TagFilter; label: string }[] = [
  { value: "work", label: "업무" },
  { value: "personal", label: "개인" },
  { value: "all", label: "전체" },
];

function formatDateHeader(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${y}년 ${m}월 ${day}일 (${weekday})`;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface Props {
  searchParams: Promise<{ tag?: string }>;
}

export default async function TimelinePage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params.tag;
  const filter: TagFilter =
    raw === "personal" || raw === "all" ? raw : "work";

  const where: { completedAt: { not: null }; tag?: string } = {
    completedAt: { not: null },
  };
  if (filter !== "all") where.tag = filter;

  const cards = await prisma.card.findMany({
    where,
    orderBy: { completedAt: "desc" },
    take: 200,
  });

  const groups = new Map<string, { date: Date; cards: typeof cards }>();
  for (const c of cards) {
    const d = c.completedAt!;
    const key = localDateKey(d);
    if (!groups.has(key)) {
      groups.set(key, {
        date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        cards: [],
      });
    }
    groups.get(key)!.cards.push(c);
  }

  const filterBar = (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-500">분야:</span>
      <div className="inline-flex rounded-md border border-neutral-300 bg-white p-0.5 text-xs">
        {FILTER_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/timeline?tag=${opt.value}`}
            className={
              "rounded px-3 py-1 font-medium transition " +
              (filter === opt.value
                ? "bg-neutral-900 text-white"
                : "text-neutral-500 hover:bg-neutral-100")
            }
          >
            {opt.label}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">회고 타임라인</h1>
          {filter === "work" && (
            <p className="mt-1 text-xs text-neutral-500">
              업무 카드만 표시 중 · 포트폴리오 모드
            </p>
          )}
        </div>
        {filterBar}
      </div>

      {groups.size === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 py-12 text-center text-sm text-neutral-500">
          {filter === "all"
            ? "아직 완료된 카드가 없어요. 보드에서 카드를 완료 컬럼으로 옮겨보세요."
            : `완료한 ${TAG_LABELS[filter] ?? filter} 카드가 없어요.`}
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(groups.values()).map((g) => (
            <section key={g.date.toISOString()}>
              <h2 className="mb-3 text-sm font-semibold text-neutral-600">
                {formatDateHeader(g.date)}
              </h2>
              <ul className="space-y-2">
                {g.cards.map((c) => (
                  <li
                    key={c.id}
                    className={
                      "rounded-lg border border-neutral-200 border-l-4 bg-white p-3 " +
                      (TAG_STYLES[c.tag] ?? "border-l-neutral-400")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-neutral-900 line-through decoration-neutral-300">
                        {c.title}
                      </span>
                      <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600">
                        {TAG_LABELS[c.tag] ?? c.tag}
                      </span>
                    </div>
                    {c.memo && <p className="mt-1 text-xs text-neutral-500">{c.memo}</p>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
