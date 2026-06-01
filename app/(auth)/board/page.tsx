import { prisma } from "@/lib/db";
import { addWeeks, getWeekStart, parseWeekParam } from "@/lib/week";
import { todayWeekday } from "@/lib/today";
import { BoardClient } from "./BoardClient";

interface Props {
  searchParams: Promise<{ week?: string }>;
}

export default async function BoardPage({ searchParams }: Props) {
  const params = await searchParams;
  const weekStart = parseWeekParam(params.week) ?? getWeekStart(new Date());

  let cards = await prisma.card.findMany({
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

  // 데이터 정리(invariant 강제): 이번 주 + dueDay=오늘요일 + column=todo → column=doing
  // (UI 추가/편집 전에 만들어진 데이터에 일관성 맞춤)
  const currentWeekStart = getWeekStart(new Date());
  const isCurrentWeek = weekStart.getTime() === currentWeekStart.getTime();
  if (isCurrentWeek) {
    const todayIdx = todayWeekday();
    const toPromote = cards
      .filter((c) => c.column === "todo" && c.dueDay === todayIdx && c.completedAt === null)
      .map((c) => c.id);
    if (toPromote.length > 0) {
      await prisma.card.updateMany({
        where: { id: { in: toPromote } },
        data: { column: "doing" },
      });
      cards = await prisma.card.findMany({
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
    }
  }

  const habitsRaw = await prisma.habit.findMany({
    where: { weekStart },
    orderBy: { createdAt: "asc" },
  });
  const habits = habitsRaw.map((h) => ({
    id: h.id,
    title: h.title,
    type: h.type as "weekday" | "weekend",
    daysCompleted: JSON.parse(h.daysCompleted ?? "[]") as number[],
  }));

  const unresolvedIssues = await prisma.issue.findMany({
    where: { status: { not: "resolved" } },
    select: { id: true, title: true },
    orderBy: { reportedAt: "desc" },
    take: 50,
  });

  // 주간 그리드 뷰용: 이번 주 7일에 해당하는 이슈
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
    <BoardClient
      weekStartIso={weekStart.toISOString()}
      initialCards={cards.map((c) => ({
        id: c.id,
        title: c.title,
        memo: c.memo,
        dueDay: c.dueDay,
        tag: c.tag,
        column: c.column,
        linkedIssue: c.issues[0] ?? null,
      }))}
      weekIssues={weekIssues}
      habits={habits}
      unresolvedIssues={unresolvedIssues}
    />
  );
}
