import { prisma } from "@/lib/db";

const TAG_STYLES: Record<string, string> = {
  work: "border-l-blue-500",
  personal: "border-l-green-500",
};

const TAG_LABELS: Record<string, string> = {
  work: "업무",
  personal: "개인",
};

function formatDateHeader(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${y}년 ${m}월 ${day}일 (${weekday})`;
}

function localDateKey(d: Date): string {
  // Group by local calendar date
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function TimelinePage() {
  const cards = await prisma.card.findMany({
    where: { completedAt: { not: null } },
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

  if (groups.size === 0) {
    return (
      <div className="py-12 text-center text-neutral-500">
        아직 완료된 카드가 없어요. 보드에서 카드를 완료 컬럼으로 옮겨보세요.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">회고 타임라인</h1>
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
  );
}
