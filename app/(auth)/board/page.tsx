import { prisma } from "@/lib/db";
import { getWeekStart, parseWeekParam } from "@/lib/week";
import { BoardClient } from "./BoardClient";

interface Props {
  searchParams: Promise<{ week?: string }>;
}

export default async function BoardPage({ searchParams }: Props) {
  const params = await searchParams;
  const weekStart = parseWeekParam(params.week) ?? getWeekStart(new Date());

  const cards = await prisma.card.findMany({
    where: { weekStart },
    orderBy: [{ column: "asc" }, { position: "asc" }],
  });

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
      }))}
    />
  );
}
