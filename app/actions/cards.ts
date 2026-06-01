"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

async function requireAuth() {
  if (!(await isAuthenticated())) throw new Error("UNAUTHORIZED");
}

export interface CreateCardInput {
  title: string;
  memo?: string;
  dueDay?: number | null;
  tag: "personal" | "work";
  weekStart: string; // ISO date string of Monday 00:00 UTC
}

export async function createCard(input: CreateCardInput) {
  await requireAuth();
  if (!input.title.trim()) throw new Error("제목이 필요해요");

  const weekStart = new Date(input.weekStart);
  const maxPos = await prisma.card.aggregate({
    where: { weekStart, column: "todo" },
    _max: { position: true },
  });

  await prisma.card.create({
    data: {
      title: input.title.trim(),
      memo: input.memo?.trim() || null,
      dueDay: input.dueDay ?? null,
      tag: input.tag,
      column: "todo",
      weekStart,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });

  revalidatePath("/board");
}

export interface UpdateCardInput {
  title?: string;
  memo?: string | null;
  dueDay?: number | null;
  tag?: "personal" | "work";
  column?: "todo" | "doing" | "done";
}

export async function updateCard(id: string, patch: UpdateCardInput) {
  await requireAuth();

  const data: Record<string, unknown> = { ...patch };
  if (patch.column === "done") {
    data.completedAt = new Date();
  } else if (patch.column) {
    data.completedAt = null;
  }

  await prisma.card.update({ where: { id }, data });

  revalidatePath("/board");
  revalidatePath("/timeline");
}

export async function deleteCard(id: string) {
  await requireAuth();
  await prisma.card.delete({ where: { id } });
  revalidatePath("/board");
  revalidatePath("/timeline");
}

export async function reorderCards(
  column: "todo" | "doing" | "done",
  orderedIds: string[],
) {
  await requireAuth();
  await prisma.$transaction(
    orderedIds.map((id, position) =>
      prisma.card.update({ where: { id }, data: { column, position } })
    )
  );
  revalidatePath("/board");
}

export async function linkIssueToCard(cardId: string, issueId: string | null) {
  await requireAuth();
  await prisma.issue.updateMany({
    where: { cardId },
    data: { cardId: null },
  });
  if (issueId) {
    await prisma.issue.update({
      where: { id: issueId },
      data: { cardId },
    });
  }
  revalidatePath("/board");
  revalidatePath("/issues");
  revalidatePath("/");
}
