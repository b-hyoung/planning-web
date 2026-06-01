"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

async function requireAuth() {
  if (!(await isAuthenticated())) throw new Error("UNAUTHORIZED");
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  priority: "low" | "med" | "high";
  status: "open" | "in_progress" | "resolved";
  reportedAt: string; // ISO datetime
  cardId?: string | null;
}

export async function createIssue(input: CreateIssueInput) {
  await requireAuth();
  if (!input.title.trim()) throw new Error("제목이 필요해요");

  await prisma.issue.create({
    data: {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority,
      status: input.status,
      reportedAt: new Date(input.reportedAt),
      resolvedAt: input.status === "resolved" ? new Date() : null,
      cardId: input.cardId ?? null,
    },
  });

  revalidatePath("/issues");
  revalidatePath("/board");
}

export interface UpdateIssueInput {
  title?: string;
  description?: string | null;
  priority?: "low" | "med" | "high";
  status?: "open" | "in_progress" | "resolved";
  reportedAt?: string;
  cardId?: string | null;
}

export async function updateIssue(id: string, patch: UpdateIssueInput) {
  await requireAuth();

  const data: Record<string, unknown> = {};
  if (patch.title !== undefined) data.title = patch.title.trim();
  if (patch.description !== undefined)
    data.description = patch.description?.trim() || null;
  if (patch.priority !== undefined) data.priority = patch.priority;
  if (patch.reportedAt !== undefined) data.reportedAt = new Date(patch.reportedAt);
  if (patch.cardId !== undefined) data.cardId = patch.cardId;

  if (patch.status !== undefined) {
    data.status = patch.status;
    if (patch.status === "resolved") {
      data.resolvedAt = new Date();
    } else {
      data.resolvedAt = null;
    }
  }

  await prisma.issue.update({ where: { id }, data });

  revalidatePath("/issues");
  revalidatePath("/board");
}

export async function deleteIssue(id: string) {
  await requireAuth();
  await prisma.issue.delete({ where: { id } });
  revalidatePath("/issues");
  revalidatePath("/board");
}
