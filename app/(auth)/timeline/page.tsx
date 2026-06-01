import Link from "next/link";
import { prisma } from "@/lib/db";
import { getWeekStart } from "@/lib/week";

type TagFilter = "work" | "personal" | "all";

const TAG_LABELS: Record<string, string> = {
  work: "업무",
  personal: "개인",
};

const FILTER_OPTIONS: { value: TagFilter; label: string }[] = [
  { value: "work", label: "업무" },
  { value: "personal", label: "개인" },
  { value: "all", label: "전체" },
];

// 포스트잇 색 팔레트 — 카드별로 회전 색상
const POSTIT_COLORS = [
  { bg: "#fef3c7", tilt: -1.5 }, // amber
  { bg: "#fde68a", tilt: 1.2 },
  { bg: "#fce7f3", tilt: -0.8 }, // pink
  { bg: "#dbeafe", tilt: 2 }, // blue
  { bg: "#bbf7d0", tilt: -1.8 }, // green
  { bg: "#e0e7ff", tilt: 1 }, // indigo
  { bg: "#fed7aa", tilt: -2.2 }, // orange
  { bg: "#fef9c3", tilt: 1.5 }, // yellow
];

function formatWeekHeader(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}년 ${m}월 ${day}일 주`;
}

function formatDayShort(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const wk = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${m}/${day} (${wk})`;
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
    take: 300,
  });

  // 주차별로 그룹핑 (월요일 자정 기준)
  const weekGroups = new Map<
    string,
    { weekStart: Date; cards: typeof cards }
  >();
  for (const c of cards) {
    const ws = getWeekStart(c.completedAt!);
    const key = ws.toISOString();
    if (!weekGroups.has(key)) {
      weekGroups.set(key, { weekStart: ws, cards: [] });
    }
    weekGroups.get(key)!.cards.push(c);
  }

  const sortedWeeks = Array.from(weekGroups.values()).sort(
    (a, b) => b.weekStart.getTime() - a.weekStart.getTime(),
  );

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
              업무 카드만 표시 · 포트폴리오 모드
            </p>
          )}
          <p className="mt-1 text-[11px] text-neutral-400">
            총 {cards.length}개 · {weekGroups.size}주
          </p>
        </div>
        {filterBar}
      </div>

      {sortedWeeks.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 py-12 text-center text-sm text-neutral-500">
          {filter === "all"
            ? "아직 완료된 카드가 없어요. 보드에서 카드를 완료 컬럼으로 옮겨보세요."
            : `완료한 ${TAG_LABELS[filter] ?? filter} 카드가 없어요.`}
        </div>
      ) : (
        <div className="space-y-10">
          {sortedWeeks.map((week) => (
            <section key={week.weekStart.toISOString()}>
              <div className="mb-4 flex items-baseline gap-3 border-b border-neutral-200 pb-2">
                <h2 className="text-lg font-bold text-neutral-900">
                  {formatWeekHeader(week.weekStart)}
                </h2>
                <span className="text-xs text-neutral-500">
                  {week.cards.length}개 완료
                </span>
              </div>
              {/* 포스트잇 그리드 */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {week.cards.map((c, i) => {
                  const color = POSTIT_COLORS[i % POSTIT_COLORS.length];
                  return (
                    <article
                      key={c.id}
                      className="group relative aspect-[5/4] overflow-hidden p-5 transition-transform hover:!rotate-0 hover:scale-105 hover:z-10"
                      style={{
                        background: color.bg,
                        transform: `rotate(${color.tilt}deg)`,
                        boxShadow:
                          "0 6px 14px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.1), inset 0 -8px 12px rgba(0,0,0,0.04)",
                        fontFamily:
                          "'Caveat', 'Nanum Pen Script', 'Comic Sans MS', system-ui, sans-serif",
                      }}
                    >
                      {/* 핀 */}
                      <span
                        aria-hidden
                        className="absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-500/80 shadow-md"
                        style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
                      />

                      {/* 날짜 + 태그 */}
                      <div className="mb-3 mt-2 flex items-center justify-between text-[11px] text-neutral-700 opacity-70">
                        <span>{formatDayShort(c.completedAt!)}</span>
                        <span className="rounded-full bg-white/40 px-2 py-0.5 font-medium">
                          {TAG_LABELS[c.tag] ?? c.tag}
                        </span>
                      </div>

                      {/* 제목 */}
                      <h3 className="line-clamp-2 text-xl font-bold leading-tight text-neutral-900">
                        {c.title}
                      </h3>

                      {/* 메모 */}
                      {c.memo && (
                        <p className="mt-2 line-clamp-4 text-sm leading-snug text-neutral-700">
                          {c.memo}
                        </p>
                      )}

                      {/* 완료 표시 */}
                      <div className="absolute bottom-3 right-4 text-2xl text-emerald-700 opacity-80">
                        ✓
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
