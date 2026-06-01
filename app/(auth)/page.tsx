import { prisma } from "@/lib/db";
import { addWeeks, getWeekStart } from "@/lib/week";
import { pickTodayCard, todayWeekday } from "@/lib/today";
import { DashboardClient } from "./DashboardClient";
import type { CardData } from "@/components/CardItem";

export default async function HomePage() {
  const weekStart = getWeekStart(new Date());
  const cards = await prisma.card.findMany({
    where: { weekStart },
    orderBy: [{ column: "asc" }, { position: "asc" }],
    include: {
      issues: {
        take: 1,
        orderBy: { reportedAt: "desc" },
        select: { id: true, title: true, status: true },
      },
    },
  });

  const cardData: CardData[] = cards.map((c) => ({
    id: c.id,
    title: c.title,
    memo: c.memo,
    dueDay: c.dueDay,
    tag: c.tag,
    column: c.column,
    linkedIssue: c.issues[0] ?? null,
  }));

  const today = pickTodayCard(cardData, todayWeekday());

  const unresolvedIssues = await prisma.issue.findMany({
    where: { status: { not: "resolved" } },
    select: { id: true, title: true },
    orderBy: { reportedAt: "desc" },
    take: 50,
  });

  // 주간 그리드용: 이번 주 7일에 해당하는 이슈
  const weekEnd = addWeeks(weekStart, 1);
  const weekIssuesRaw = await prisma.issue.findMany({
    where: { reportedAt: { gte: weekStart, lt: weekEnd } },
    orderBy: { reportedAt: "asc" },
    select: {
      id: true,
      title: true,
      reportedAt: true,
      priority: true,
      status: true,
    },
  });
  const weekIssues = weekIssuesRaw.map((i) => ({
    id: i.id,
    title: i.title,
    reportedAtIso: i.reportedAt.toISOString(),
    priority: i.priority as "low" | "med" | "high",
    status: i.status as "open" | "in_progress" | "resolved",
  }));

  return (
    <DashboardClient
      weekStartIso={weekStart.toISOString()}
      weekCards={cardData}
      weekIssues={weekIssues}
      todayCardId={today?.id ?? null}
      unresolvedIssues={unresolvedIssues}
    />
  );
}
