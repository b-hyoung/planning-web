import { prisma } from "@/lib/db";
import { IssuesClient } from "./IssuesClient";

interface Props {
  searchParams: Promise<{ m?: string }>;
}

function monthBounds(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { start, end };
}

export default async function IssuesPage({ searchParams }: Props) {
  const params = await searchParams;
  const now = new Date();
  const monthDate = params.m
    ? new Date(`${params.m}-01T00:00:00`)
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const { start, end } = monthBounds(monthDate);

  const issues = await prisma.issue.findMany({
    where: { reportedAt: { gte: start, lt: end } },
    orderBy: { reportedAt: "asc" },
    include: { card: { select: { id: true, title: true } } },
  });

  const monthCards = await prisma.card.findMany({
    where: {
      weekStart: {
        gte: new Date(start.getFullYear(), start.getMonth() - 1, 1),
        lt: end,
      },
    },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <IssuesClient
      monthIso={monthDate.toISOString()}
      issues={issues.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        priority: i.priority as "low" | "med" | "high",
        status: i.status as "open" | "in_progress" | "resolved",
        reportedAtIso: i.reportedAt.toISOString(),
        cardId: i.cardId,
        cardTitle: i.card?.title ?? null,
      }))}
      cardOptions={monthCards}
    />
  );
}
