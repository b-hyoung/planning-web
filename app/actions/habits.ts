"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

async function requireAuth() {
  if (!(await isAuthenticated())) throw new Error("UNAUTHORIZED");
}

export interface CreateHabitInput {
  title: string;
  type: "weekday" | "weekend";
  weekStart: string; // ISO Monday
}

export async function createHabit(input: CreateHabitInput) {
  await requireAuth();
  if (!input.title.trim()) throw new Error("제목이 필요해요");

  await prisma.habit.create({
    data: {
      title: input.title.trim(),
      type: input.type,
      weekStart: new Date(input.weekStart),
      daysCompleted: "[]",
    },
  });

  revalidatePath("/board");
}

export async function toggleHabitDay(id: string, dayIndex: number) {
  await requireAuth();
  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit) throw new Error("Habit not found");
  const days: number[] = JSON.parse(habit.daysCompleted ?? "[]");
  const exists = days.includes(dayIndex);
  const next = exists
    ? days.filter((d) => d !== dayIndex)
    : [...days, dayIndex].sort((a, b) => a - b);

  await prisma.habit.update({
    where: { id },
    data: { daysCompleted: JSON.stringify(next) },
  });

  revalidatePath("/board");
}

export async function updateHabitTitle(id: string, title: string) {
  await requireAuth();
  if (!title.trim()) throw new Error("제목이 필요해요");
  await prisma.habit.update({
    where: { id },
    data: { title: title.trim() },
  });
  revalidatePath("/board");
}

export async function deleteHabit(id: string) {
  await requireAuth();
  await prisma.habit.delete({ where: { id } });
  revalidatePath("/board");
}
