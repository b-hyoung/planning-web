# Dashboard + Issues + 3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add (a) Issue tracker with monthly calendar, (b) Card↔Issue loose link, and (c) a Three.js "floating cards" 3D dashboard at `/` with GSAP camera transitions and mobile fallback. Keep existing /board kanban as drill-in detail.

**Architecture:** Three feature blocks built in order: (1) Issue data + UI on existing 2D Next.js patterns; (2) link Issues to Cards; (3) 3D dashboard using React Three Fiber. Existing routes and DB layer stay; new prisma model, new actions, new components added side-by-side.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Prisma 7 (better-sqlite3 adapter), Three.js + @react-three/fiber + @react-three/drei, GSAP, react-day-picker, iron-session, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-01-dashboard-issues-3d-design.md`

---

## File Structure

Files this plan creates or modifies (paths relative to `/Users/bobs/Desktop/bobs_project/planning_web/`):

**Backend / data**
```
prisma/schema.prisma                 (modify — add Issue model + Card relation)
app/actions/issues.ts                (new)
app/actions/cards.ts                 (modify — add linkIssueToCard)
lib/today.ts                         (new)
lib/today.test.ts                    (new)
```

**Issues UI**
```
components/issues/Calendar.tsx
components/issues/IssueModal.tsx
components/issues/IssuesList.tsx
app/(auth)/issues/page.tsx
app/(auth)/issues/IssuesClient.tsx
```

**CardModal extension**
```
components/CardModal.tsx             (modify — add issue-link section)
components/CardItem.tsx              (modify — CardData gains `issues` count)
app/(auth)/board/page.tsx            (modify — include issues in findMany)
```

**3D scene**
```
components/scene/Scene.tsx           (Canvas wrapper)
components/scene/Particles.tsx       (background particles)
components/scene/Card3D.tsx          (single Plane + Html card)
components/scene/TodayCard.tsx       (today card placement)
components/scene/FloatingCards.tsx   (background cards in TODAY mode)
components/scene/WeekCardsArc.tsx    (WEEK mode arc layout)
components/scene/useCameraMode.ts    (GSAP camera transitions)
components/scene/SceneErrorBoundary.tsx
components/MobileFallback.tsx        (non-3D fallback)
lib/isMobile.ts                      (UA + width sniff helper)
```

**Main page / nav**
```
app/(auth)/page.tsx                  (new — replaces /'s redirect; renders Scene or MobileFallback)
app/(auth)/layout.tsx                (modify — add /issues nav link, point home to "오늘")
README.md                            (modify — append new features + checklist)
```

Each file has a single responsibility. Scene components are split so cameras, layout math, and visuals can be reasoned about separately.

---

## Conventions used throughout this plan

- **Working directory** for all commands: `/Users/bobs/Desktop/bobs_project/planning_web`
- **Branch:** all work on `main` (this is a 1-user public repo; we add commits straight to main since there's no review process)
- After each task: tsc + build (or test) before commit. Build failures = task incomplete.
- Always import Prisma client from `@/lib/db`, never directly from `@/generated/prisma/client` in feature code.
- Use `"use server"` for any file in `app/actions/`. Use `"use client"` for interactive components.

---

## Task 1: Add Issue model + Card relation to Prisma

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Update prisma/schema.prisma**

Replace the file contents with:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model Card {
  id          String    @id @default(cuid())
  title       String
  memo        String?
  dueDay      Int?      // 0=Mon ... 6=Sun, null = unspecified
  tag         String    // "personal" | "work"
  column      String    // "todo" | "doing" | "done"
  weekStart   DateTime
  position    Int
  createdAt   DateTime  @default(now())
  completedAt DateTime?

  issues      Issue[]

  @@index([weekStart])
  @@index([completedAt])
}

model Issue {
  id          String    @id @default(cuid())
  title       String
  description String?
  priority    String    // "low" | "med" | "high"
  status      String    // "open" | "in_progress" | "resolved"
  reportedAt  DateTime
  resolvedAt  DateTime?
  cardId      String?
  card        Card?     @relation(fields: [cardId], references: [id], onDelete: SetNull)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([reportedAt])
  @@index([status])
  @@index([cardId])
}
```

- [ ] **Step 2: Push schema and regenerate client**

```bash
cd /Users/bobs/Desktop/bobs_project/planning_web
npx prisma db push
```

Expected: "Your database is now in sync with your Prisma schema." Client regenerated under `generated/prisma/`.

- [ ] **Step 3: Verify TypeScript still compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(db): add Issue model with loose Card relation"
```

---

## Task 2: Issue Server Actions

**Files:**
- Create: `app/actions/issues.ts`

- [ ] **Step 1: Create app/actions/issues.ts**

```ts
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
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/actions/issues.ts
git commit -m "feat(actions): add Issue CRUD server actions"
```

---

## Task 3: Add `linkIssueToCard` to existing card actions

**Files:**
- Modify: `app/actions/cards.ts`

- [ ] **Step 1: Append to `app/actions/cards.ts`**

Append at end of file:

```ts
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
```

NOTE: This sets only one issue per card at a time. To unlink, pass `issueId = null`. To switch, pass the new issueId; previous link is cleared first.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/actions/cards.ts
git commit -m "feat(actions): add linkIssueToCard"
```

---

## Task 4: Today-priority helper (TDD)

**Files:**
- Create: `lib/today.ts`, `lib/today.test.ts`

- [ ] **Step 1: Write failing tests in lib/today.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { pickTodayCard, type CardForToday } from "./today";

const base: Omit<CardForToday, "id" | "dueDay" | "column"> = {
  title: "x",
  tag: "work",
};

describe("pickTodayCard", () => {
  it("returns null when no cards", () => {
    expect(pickTodayCard([], 0)).toBeNull();
  });

  it("prefers a 'doing' card whose dueDay matches today", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, dueDay: 2, column: "doing" },
      { id: "2", ...base, dueDay: 0, column: "doing" }, // today=0, this one
      { id: "3", ...base, dueDay: 0, column: "todo" },
    ];
    expect(pickTodayCard(cards, 0)?.id).toBe("2");
  });

  it("falls back to 'todo' card matching today when no doing match", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, dueDay: 2, column: "doing" },
      { id: "2", ...base, dueDay: 0, column: "todo" },
    ];
    expect(pickTodayCard(cards, 0)?.id).toBe("2");
  });

  it("falls back to the card with closest dueDay if no today match", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, dueDay: 4, column: "todo" }, // Fri, today=Mon, dist 3
      { id: "2", ...base, dueDay: 2, column: "todo" }, // Wed, today=Mon, dist 1
      { id: "3", ...base, dueDay: 6, column: "doing" }, // Sun, today=Mon, dist 1 — tie, picks first
    ];
    // today = Mon (0)
    expect(pickTodayCard(cards, 0)?.id).toBe("2");
  });

  it("ignores 'done' cards", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, dueDay: 0, column: "done" },
      { id: "2", ...base, dueDay: 0, column: "todo" },
    ];
    expect(pickTodayCard(cards, 0)?.id).toBe("2");
  });

  it("ignores cards with null dueDay when computing closest", () => {
    const cards: CardForToday[] = [
      { id: "1", ...base, dueDay: null, column: "todo" },
      { id: "2", ...base, dueDay: 3, column: "todo" }, // today=0, picked
    ];
    expect(pickTodayCard(cards, 0)?.id).toBe("2");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL — `lib/today.ts` does not exist.

- [ ] **Step 3: Implement lib/today.ts**

```ts
export interface CardForToday {
  id: string;
  title: string;
  tag: string;
  dueDay: number | null;
  column: string; // "todo" | "doing" | "done"
}

/**
 * Pick THE card to feature in the TODAY view.
 * Priority order:
 *   1) column=doing && dueDay === today
 *   2) column=todo  && dueDay === today
 *   3) any non-done card with closest dueDay to today (min absolute diff)
 *   4) null
 */
export function pickTodayCard<T extends CardForToday>(
  cards: T[],
  todayWeekday: number, // 0=Mon ... 6=Sun
): T | null {
  if (cards.length === 0) return null;

  const active = cards.filter((c) => c.column !== "done");
  if (active.length === 0) return null;

  const matchToday = active.filter((c) => c.dueDay === todayWeekday);

  const doingToday = matchToday.find((c) => c.column === "doing");
  if (doingToday) return doingToday;

  const todoToday = matchToday.find((c) => c.column === "todo");
  if (todoToday) return todoToday;

  // Fall back: closest dueDay
  let best: T | null = null;
  let bestDist = Infinity;
  for (const c of active) {
    if (c.dueDay === null) continue;
    const dist = Math.abs(c.dueDay - todayWeekday);
    if (dist < bestDist) {
      best = c;
      bestDist = dist;
    }
  }
  return best;
}

/**
 * 0=Mon ... 6=Sun, matching the rest of the app's weekday convention.
 * JavaScript Date.getDay(): 0=Sun ... 6=Sat. This helper shifts.
 */
export function todayWeekday(now: Date = new Date()): number {
  const jsDay = now.getDay(); // 0=Sun
  return (jsDay + 6) % 7; // → 0=Mon
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: PASS (all 6 today tests + existing 9 week tests = 15 total).

- [ ] **Step 5: Commit**

```bash
git add lib/today.ts lib/today.test.ts
git commit -m "feat(lib): add today-priority picker with tests"
```

---

## Task 5: Install issues UI deps (react-day-picker, date-fns already present)

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
cd /Users/bobs/Desktop/bobs_project/planning_web
npm install react-day-picker
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install react-day-picker"
```

---

## Task 6: Calendar component

**Files:**
- Create: `components/issues/Calendar.tsx`

- [ ] **Step 1: Create components/issues/Calendar.tsx**

```tsx
"use client";

import { DayPicker } from "react-day-picker";
import { useMemo } from "react";
import "react-day-picker/dist/style.css";

export interface CalendarIssue {
  id: string;
  reportedAt: Date;
  priority: "low" | "med" | "high";
  status: "open" | "in_progress" | "resolved";
}

interface Props {
  month: Date;
  onMonthChange: (d: Date) => void;
  issues: CalendarIssue[];
  selected: Date | null;
  onSelect: (d: Date) => void;
}

const PRIORITY_DOT: Record<CalendarIssue["priority"], string> = {
  low: "bg-neutral-400",
  med: "bg-amber-500",
  high: "bg-red-500",
};

export function Calendar({ month, onMonthChange, issues, selected, onSelect }: Props) {
  // Group issues by yyyy-mm-dd
  const byDate = useMemo(() => {
    const map = new Map<string, CalendarIssue[]>();
    for (const i of issues) {
      const d = i.reportedAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(i);
    }
    return map;
  }, [issues]);

  function dayKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <DayPicker
        mode="single"
        month={month}
        onMonthChange={onMonthChange}
        selected={selected ?? undefined}
        onSelect={(d) => d && onSelect(d)}
        showOutsideDays
        weekStartsOn={1}
        components={{
          DayContent: (props) => {
            const items = byDate.get(dayKey(props.date)) ?? [];
            const unresolved = items.filter((i) => i.status !== "resolved");
            return (
              <div className="relative">
                <span>{props.date.getDate()}</span>
                {items.length > 0 && (
                  <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                    {items.slice(0, 3).map((i) => (
                      <span
                        key={i.id}
                        className={
                          "h-1.5 w-1.5 rounded-full " +
                          PRIORITY_DOT[i.priority] +
                          (i.status === "resolved" ? " opacity-30" : "")
                        }
                      />
                    ))}
                    {items.length > 3 && (
                      <span className="text-[8px] text-neutral-500">+{items.length - 3}</span>
                    )}
                  </div>
                )}
                {unresolved.length === 0 && items.length > 0 && (
                  <span className="sr-only">all resolved</span>
                )}
              </div>
            );
          },
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

If react-day-picker types complain about the `DayContent` prop name (the API may differ slightly between v8/v9), open `node_modules/react-day-picker/dist/index.d.ts` and use the correct component slot name. If v9, the slot is `Day` and receives different props — adapt the inner JSX accordingly.

- [ ] **Step 3: Commit**

```bash
git add components/issues/Calendar.tsx
git commit -m "feat(issues): add Calendar component"
```

---

## Task 7: IssueModal component

**Files:**
- Create: `components/issues/IssueModal.tsx`

- [ ] **Step 1: Create components/issues/IssueModal.tsx**

```tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { createIssue, updateIssue, deleteIssue } from "@/app/actions/issues";

export interface IssueFormCard {
  id: string;
  title: string;
}

export interface IssueData {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "med" | "high";
  status: "open" | "in_progress" | "resolved";
  reportedAt: Date;
  cardId: string | null;
}

interface Props {
  open: boolean;
  initial: IssueData | null; // null = create mode
  defaultDate?: Date;        // used for create mode default
  cardOptions: IssueFormCard[];
  onClose: () => void;
}

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function IssueModal({ open, initial, defaultDate, cardOptions, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "med" | "high">("med");
  const [status, setStatus] = useState<"open" | "in_progress" | "resolved">("open");
  const [reportedAt, setReportedAt] = useState(toDateInput(new Date()));
  const [cardId, setCardId] = useState<string | "">("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description ?? "");
      setPriority(initial.priority);
      setStatus(initial.status);
      setReportedAt(toDateInput(initial.reportedAt));
      setCardId(initial.cardId ?? "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("med");
      setStatus("open");
      setReportedAt(toDateInput(defaultDate ?? new Date()));
      setCardId("");
    }
  }, [open, initial, defaultDate]);

  if (!open) return null;

  function save() {
    startTransition(async () => {
      try {
        const data = {
          title,
          description: description || undefined,
          priority,
          status,
          reportedAt: new Date(reportedAt).toISOString(),
          cardId: cardId || null,
        };
        if (initial) await updateIssue(initial.id, data);
        else await createIssue(data);
        onClose();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  function remove() {
    if (!initial) return;
    if (!confirm("이 이슈를 삭제할까요?")) return;
    startTransition(async () => {
      await deleteIssue(initial.id);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-base font-semibold">{initial ? "이슈 수정" : "이슈 등록"}</h3>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="설명 / 재현 / 시도한 것"
          rows={4}
          className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-neutral-500">
            우선순위
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="low">낮음</option>
              <option value="med">보통</option>
              <option value="high">높음</option>
            </select>
          </label>
          <label className="text-xs text-neutral-500">
            상태
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="open">열림</option>
              <option value="in_progress">진행 중</option>
              <option value="resolved">해결됨</option>
            </select>
          </label>
          <label className="text-xs text-neutral-500">
            발생일
            <input
              type="date"
              value={reportedAt}
              onChange={(e) => setReportedAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-neutral-500">
            연결 카드
            <select
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="">없음</option>
              {cardOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex justify-between pt-2">
          <button
            onClick={remove}
            disabled={!initial || pending}
            className="text-sm text-red-600 hover:underline disabled:opacity-30"
          >
            삭제
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-1.5 text-sm hover:bg-neutral-100"
            >
              취소
            </button>
            <button
              onClick={save}
              disabled={pending || !title.trim()}
              className="rounded-lg bg-neutral-900 px-4 py-1.5 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/issues/IssueModal.tsx
git commit -m "feat(issues): add IssueModal"
```

---

## Task 8: IssuesList component

**Files:**
- Create: `components/issues/IssuesList.tsx`

- [ ] **Step 1: Create components/issues/IssuesList.tsx**

```tsx
"use client";

import { useMemo, useState } from "react";

export type ListFilter = "all" | "unresolved" | "resolved";

export interface IssueRow {
  id: string;
  title: string;
  priority: "low" | "med" | "high";
  status: "open" | "in_progress" | "resolved";
  reportedAt: Date;
  cardTitle?: string | null;
}

interface Props {
  issues: IssueRow[];
  onSelect: (id: string) => void;
}

const PRIORITY_RANK: Record<IssueRow["priority"], number> = { high: 0, med: 1, low: 2 };
const STATUS_LABEL: Record<IssueRow["status"], string> = {
  open: "열림",
  in_progress: "진행중",
  resolved: "해결",
};

export function IssuesList({ issues, onSelect }: Props) {
  const [filter, setFilter] = useState<ListFilter>("unresolved");

  const visible = useMemo(() => {
    let list = issues;
    if (filter === "unresolved") list = list.filter((i) => i.status !== "resolved");
    else if (filter === "resolved") list = list.filter((i) => i.status === "resolved");
    return [...list].sort((a, b) => {
      const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (p !== 0) return p;
      return b.reportedAt.getTime() - a.reportedAt.getTime();
    });
  }, [issues, filter]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex gap-2 text-xs">
        {(["all", "unresolved", "resolved"] as ListFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              "rounded px-2 py-1 " +
              (filter === f
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100")
            }
          >
            {f === "all" ? "전체" : f === "unresolved" ? "미해결" : "해결됨"}
          </button>
        ))}
      </div>
      <ul className="space-y-1.5">
        {visible.map((i) => (
          <li
            key={i.id}
            onClick={() => onSelect(i.id)}
            className={
              "cursor-pointer rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 " +
              (i.status === "resolved" ? "opacity-60" : "")
            }
          >
            <div className="flex items-start gap-2">
              <span
                className={
                  "mt-1 h-2 w-2 shrink-0 rounded-full " +
                  (i.priority === "high"
                    ? "bg-red-500"
                    : i.priority === "med"
                    ? "bg-amber-500"
                    : "bg-neutral-400")
                }
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{i.title}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-neutral-500">
                  <span>{STATUS_LABEL[i.status]}</span>
                  <span>·</span>
                  <span>
                    {i.reportedAt.getMonth() + 1}/{i.reportedAt.getDate()}
                  </span>
                  {i.cardTitle && (
                    <>
                      <span>·</span>
                      <span className="truncate">🔗 {i.cardTitle}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="py-6 text-center text-xs text-neutral-400">없음</li>
        )}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/issues/IssuesList.tsx
git commit -m "feat(issues): add IssuesList"
```

---

## Task 9: /issues page (server fetches + client wrapper)

**Files:**
- Create: `app/(auth)/issues/page.tsx`, `app/(auth)/issues/IssuesClient.tsx`

- [ ] **Step 1: Create app/(auth)/issues/page.tsx**

```tsx
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

  // Card options for issue→card linking: this month's cards (broad enough)
  const monthCards = await prisma.card.findMany({
    where: { weekStart: { gte: new Date(start.getFullYear(), start.getMonth() - 1, 1), lt: end } },
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
```

- [ ] **Step 2: Create app/(auth)/issues/IssuesClient.tsx**

```tsx
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, type CalendarIssue } from "@/components/issues/Calendar";
import { IssuesList, type IssueRow } from "@/components/issues/IssuesList";
import { IssueModal, type IssueData, type IssueFormCard } from "@/components/issues/IssueModal";

interface IssuePayload {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "med" | "high";
  status: "open" | "in_progress" | "resolved";
  reportedAtIso: string;
  cardId: string | null;
  cardTitle: string | null;
}

interface Props {
  monthIso: string;
  issues: IssuePayload[];
  cardOptions: IssueFormCard[];
}

export function IssuesClient({ monthIso, issues: initial, cardOptions }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const month = new Date(monthIso);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState<{ date: Date } | null>(null);

  // Re-sync local copy of issues when server data refreshes
  const [issues, setIssues] = useState<IssuePayload[]>(initial);
  const prevInitial = useRef(initial);
  useEffect(() => {
    if (prevInitial.current !== initial) {
      prevInitial.current = initial;
      setIssues(initial);
    }
  }, [initial]);

  const calendarIssues: CalendarIssue[] = useMemo(
    () =>
      issues.map((i) => ({
        id: i.id,
        reportedAt: new Date(i.reportedAtIso),
        priority: i.priority,
        status: i.status,
      })),
    [issues]
  );

  const listIssues: IssueRow[] = useMemo(
    () =>
      issues
        .filter((i) =>
          selectedDate
            ? new Date(i.reportedAtIso).toDateString() === selectedDate.toDateString()
            : true
        )
        .map((i) => ({
          id: i.id,
          title: i.title,
          priority: i.priority,
          status: i.status,
          reportedAt: new Date(i.reportedAtIso),
          cardTitle: i.cardTitle,
        })),
    [issues, selectedDate]
  );

  function changeMonth(d: Date) {
    const next = new URLSearchParams(params.toString());
    next.set("m", `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    router.push(`/issues?${next.toString()}`);
  }

  function modalIssue(): IssueData | null {
    if (!editingId) return null;
    const i = issues.find((x) => x.id === editingId);
    if (!i) return null;
    return {
      id: i.id,
      title: i.title,
      description: i.description,
      priority: i.priority,
      status: i.status,
      reportedAt: new Date(i.reportedAtIso),
      cardId: i.cardId,
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">이슈</h1>
        <button
          onClick={() => setCreating({ date: selectedDate ?? new Date() })}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800"
        >
          + 새 이슈
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
        <Calendar
          month={month}
          onMonthChange={changeMonth}
          issues={calendarIssues}
          selected={selectedDate}
          onSelect={(d) => setSelectedDate(d)}
        />
        <div className="space-y-3">
          {selectedDate && (
            <div className="text-xs text-neutral-500">
              선택일: {selectedDate.toLocaleDateString("ko-KR")}
              <button
                onClick={() => setSelectedDate(null)}
                className="ml-2 text-neutral-400 hover:text-neutral-700"
              >
                (해제)
              </button>
            </div>
          )}
          <IssuesList issues={listIssues} onSelect={(id) => setEditingId(id)} />
        </div>
      </div>
      <IssueModal
        open={!!editingId || !!creating}
        initial={modalIssue()}
        defaultDate={creating?.date}
        cardOptions={cardOptions}
        onClose={() => {
          setEditingId(null);
          setCreating(null);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: `/issues` appears in the build route list.

- [ ] **Step 4: Commit**

```bash
git add 'app/(auth)/issues'
git commit -m "feat(issues): add /issues page with calendar + list + modal"
```

---

## Task 10: Add /issues nav link to auth layout

**Files:**
- Modify: `app/(auth)/layout.tsx`

- [ ] **Step 1: Open the file and insert an "이슈" link after the 보드 link**

Locate the navigation `<nav>` block. Change from:

```tsx
<Link href="/board" className="font-semibold">주간 플래너</Link>
<Link href="/board" className="text-neutral-600 hover:text-neutral-900">보드</Link>
<Link href="/timeline" className="text-neutral-600 hover:text-neutral-900">회고</Link>
```

to:

```tsx
<Link href="/" className="font-semibold">주간 플래너</Link>
<Link href="/" className="text-neutral-600 hover:text-neutral-900">오늘</Link>
<Link href="/board" className="text-neutral-600 hover:text-neutral-900">보드</Link>
<Link href="/issues" className="text-neutral-600 hover:text-neutral-900">이슈</Link>
<Link href="/timeline" className="text-neutral-600 hover:text-neutral-900">회고</Link>
```

NOTE: the brand link now points to `/` (the new dashboard). Until Task 21 creates `/`, that link will 404 — that's expected mid-plan.

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add 'app/(auth)/layout.tsx'
git commit -m "feat(nav): add 오늘/이슈 nav links"
```

---

## Task 11: Extend CardModal with issue link

**Files:**
- Modify: `components/CardModal.tsx`

- [ ] **Step 1: Add issue-link section to CardModal**

Add this to the CardData shape — the modal needs to know about a linked issue. Open `components/CardItem.tsx` and update the `CardData` interface:

```ts
// Update the existing CardData interface in components/CardItem.tsx:
export interface CardData {
  id: string;
  title: string;
  memo: string | null;
  dueDay: number | null;
  tag: string;
  column: string;
  linkedIssue?: { id: string; title: string; status: string } | null;
}
```

Now edit `components/CardModal.tsx`. Add imports at top:

```tsx
import { linkIssueToCard } from "@/app/actions/cards";
```

Add a new prop type — extend the existing `Props`:

```tsx
interface Props {
  card: CardData | null;
  onClose: () => void;
  unresolvedIssues?: { id: string; title: string }[]; // for the dropdown
}
```

Add state for the issue link picker. Inside the component, near other useState calls:

```tsx
const [linkingIssueId, setLinkingIssueId] = useState<string>("");

useEffect(() => {
  if (card) {
    setLinkingIssueId(card.linkedIssue?.id ?? "");
  }
}, [card]);
```

Add a section in the modal JSX, right before the save/cancel buttons:

```tsx
<div>
  <span className="mb-1 block text-xs text-neutral-500">연결 이슈</span>
  <select
    value={linkingIssueId}
    onChange={(e) => setLinkingIssueId(e.target.value)}
    className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
  >
    <option value="">없음</option>
    {(props.unresolvedIssues ?? []).map((i) => (
      <option key={i.id} value={i.id}>{i.title}</option>
    ))}
    {card.linkedIssue && !(props.unresolvedIssues ?? []).find((i) => i.id === card.linkedIssue!.id) && (
      <option value={card.linkedIssue.id}>{card.linkedIssue.title} (해결됨)</option>
    )}
  </select>
</div>
```

Update the `save()` function to also call `linkIssueToCard`:

```tsx
function save() {
  startTransition(async () => {
    try {
      await updateCard(card!.id, { title, memo: memo || null, dueDay, tag });
      const currentLink = card!.linkedIssue?.id ?? "";
      if (linkingIssueId !== currentLink) {
        await linkIssueToCard(card!.id, linkingIssueId || null);
      }
      onClose();
    } catch (err) {
      alert((err as Error).message);
    }
  });
}
```

Also change the destructured props at the top of the component from `({ card, onClose })` to `(props: Props)` and use `const { card, onClose } = props;` inside, OR add `unresolvedIssues` to the destructure. Whichever you choose, the JSX above expects `props.unresolvedIssues`.

- [ ] **Step 2: Update CardItem.tsx and any consumer that didn't supply `linkedIssue`**

The new optional `linkedIssue?: ... | null` field on `CardData` is optional, so existing call sites in BoardClient compile without change. Verify with:

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Update app/(auth)/board/page.tsx to include linked issue in fetch**

Replace the prisma query and the map shape:

```tsx
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
  />
);
```

- [ ] **Step 4: Pass `unresolvedIssues` from BoardClient to CardModal**

In `app/(auth)/board/BoardClient.tsx`, add a prop `unresolvedIssues` (the page should fetch and pass them):

In `page.tsx`, also fetch:

```tsx
const unresolvedIssues = await prisma.issue.findMany({
  where: { status: { not: "resolved" } },
  select: { id: true, title: true },
  orderBy: { reportedAt: "desc" },
  take: 50,
});
```

Pass to `<BoardClient>` along with the existing props:

```tsx
<BoardClient
  weekStartIso={weekStart.toISOString()}
  initialCards={...}
  unresolvedIssues={unresolvedIssues}
/>
```

In `BoardClient.tsx`, accept the prop and forward it to `<CardModal>`:

```tsx
interface Props {
  weekStartIso: string;
  initialCards: CardData[];
  unresolvedIssues: { id: string; title: string }[];
}

// ...
<CardModal
  card={editing}
  onClose={() => setEditing(null)}
  unresolvedIssues={unresolvedIssues}
/>
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: success, /board still works, new field flows through.

- [ ] **Step 6: Commit**

```bash
git add components/CardModal.tsx components/CardItem.tsx 'app/(auth)/board'
git commit -m "feat(cards): link issues to cards from CardModal"
```

---

## Task 12: Install 3D / animation dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
cd /Users/bobs/Desktop/bobs_project/planning_web
npm install three @react-three/fiber @react-three/drei gsap
npm install -D @types/three
```

If a peer dep warning about React 19 appears for R3F, install the latest R3F (`@react-three/fiber@latest`) which supports React 19. `npm install @react-three/fiber@latest @react-three/drei@latest`.

- [ ] **Step 2: Quick smoke build**

```bash
npm run build
```

Expected: success. (No imports yet — just deps installed.)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install three, R3F, drei, gsap"
```

---

## Task 13: Mobile detection helper + MobileFallback component

**Files:**
- Create: `lib/isMobile.ts`, `components/MobileFallback.tsx`

- [ ] **Step 1: Create lib/isMobile.ts**

```ts
"use client";

import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      const narrow = window.innerWidth < breakpoint;
      const touch = matchMedia("(pointer: coarse)").matches;
      setIsMobile(narrow || touch);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}
```

- [ ] **Step 2: Create components/MobileFallback.tsx**

```tsx
"use client";

import Link from "next/link";
import type { CardData } from "./CardItem";

interface Props {
  todayCard: CardData | null;
  weekCards: CardData[];
}

export function MobileFallback({ todayCard, weekCards }: Props) {
  return (
    <div className="space-y-5">
      <section>
        <div className="text-xs font-semibold uppercase text-neutral-500">오늘</div>
        {todayCard ? (
          <Link
            href="/board"
            className="mt-2 block rounded-2xl border border-neutral-200 bg-white p-5 shadow"
          >
            <div className="text-lg font-semibold">{todayCard.title}</div>
            {todayCard.memo && <p className="mt-2 text-sm text-neutral-600">{todayCard.memo}</p>}
          </Link>
        ) : (
          <div className="mt-2 rounded-2xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500">
            오늘 마감인 카드가 없어요. <Link href="/board" className="underline">보드</Link> 에서 추가하세요.
          </div>
        )}
      </section>
      <section>
        <div className="text-xs font-semibold uppercase text-neutral-500">이번 주</div>
        <ul className="mt-2 space-y-1.5">
          {weekCards
            .filter((c) => c.column !== "done")
            .map((c) => (
              <li key={c.id}>
                <Link
                  href="/board"
                  className="block rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                >
                  {c.title}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add lib/isMobile.ts components/MobileFallback.tsx
git commit -m "feat(mobile): add useIsMobile + MobileFallback"
```

---

## Task 14: Scene infrastructure — Canvas, ErrorBoundary, Particles

**Files:**
- Create: `components/scene/Scene.tsx`, `components/scene/SceneErrorBoundary.tsx`, `components/scene/Particles.tsx`

- [ ] **Step 1: Create components/scene/SceneErrorBoundary.tsx**

```tsx
"use client";

import React from "react";

export class SceneErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error("[Scene]", error);
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}
```

- [ ] **Step 2: Create components/scene/Particles.tsx**

```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  count?: number;
}

export function Particles({ count = 200 }: Props) {
  const ref = useRef<THREE.Points>(null);

  const positions = (() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
    }
    return arr;
  })();

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        sizeAttenuation
        color="#7c93b0"
        transparent
        opacity={0.6}
      />
    </points>
  );
}
```

- [ ] **Step 3: Create components/scene/Scene.tsx** (Canvas wrapper, accepts children — actual card components come in later tasks)

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Particles } from "./Particles";

interface Props {
  children: React.ReactNode;
}

export function Scene({ children }: Props) {
  return (
    <div className="relative h-[calc(100vh-12rem)] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#0b1023] via-[#111738] to-[#161c44]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
      >
        <fog attach="fog" args={["#161c44", 12, 40]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={0.6} />
        <Particles count={250} />
        {children}
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

R3F server import concerns: `Canvas` is a client component, used here under `"use client"` — should be fine. If Next 16 / Turbopack complains about `three` ESM/CJS, see if `transpilePackages: ["three"]` is needed in `next.config.ts`. Add if necessary.

- [ ] **Step 5: Commit**

```bash
git add components/scene
git commit -m "feat(3d): add Scene canvas + particles + error boundary"
```

---

## Task 15: 3D Card primitive (Plane + Html)

**Files:**
- Create: `components/scene/Card3D.tsx`

- [ ] **Step 1: Create components/scene/Card3D.tsx**

```tsx
"use client";

import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { CardData } from "../CardItem";

interface Props {
  card: CardData;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onClick?: () => void;
}

const TAG_COLOR: Record<string, string> = {
  work: "#4a90e2",
  personal: "#7cb342",
};

export function Card3D({ card, position, rotation = [0, 0, 0], scale = 1, onClick }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;
    const targetZ = hovered ? position[2] + 0.5 : position[2];
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.1;
  });

  const cardColor = TAG_COLOR[card.tag] ?? "#888";

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color={cardColor} metalness={0.1} roughness={0.6} />
      </mesh>
      <Html
        position={[0, 0, 0.01]}
        center
        distanceFactor={6}
        style={{
          width: "260px",
          height: "180px",
          background: "white",
          borderLeft: `6px solid ${cardColor}`,
          borderRadius: "10px",
          padding: "14px 16px",
          boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
          fontFamily: "system-ui",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>{card.title}</div>
        {card.memo && (
          <p style={{ marginTop: 6, fontSize: 11, color: "#666", lineHeight: 1.4 }}>
            {card.memo.length > 90 ? card.memo.slice(0, 90) + "…" : card.memo}
          </p>
        )}
      </Html>
    </group>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add components/scene/Card3D.tsx
git commit -m "feat(3d): add Card3D primitive (Plane + Html)"
```

---

## Task 16: TODAY mode — TodayCard placement

**Files:**
- Create: `components/scene/TodayCard.tsx`

- [ ] **Step 1: Create components/scene/TodayCard.tsx**

```tsx
"use client";

import { Card3D } from "./Card3D";
import type { CardData } from "../CardItem";

interface Props {
  card: CardData | null;
  onClick?: () => void;
}

export function TodayCard({ card, onClick }: Props) {
  if (!card) return null;
  return (
    <Card3D
      card={card}
      position={[0, 0, 2]}
      scale={1.4}
      onClick={onClick}
    />
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/scene/TodayCard.tsx
git commit -m "feat(3d): add TodayCard placement"
```

---

## Task 17: TODAY mode — FloatingCards background

**Files:**
- Create: `components/scene/FloatingCards.tsx`

- [ ] **Step 1: Create components/scene/FloatingCards.tsx**

```tsx
"use client";

import { Float } from "@react-three/drei";
import { useMemo } from "react";
import { Card3D } from "./Card3D";
import type { CardData } from "../CardItem";

interface Props {
  cards: CardData[];
  onCardClick: (card: CardData) => void;
}

// Stable pseudo-random positions seeded from id
function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  return Math.abs(h);
}

function placement(id: string, index: number): {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
} {
  const s = hashSeed(id);
  const angle = (index * 1.3 + (s % 17) / 17) * Math.PI;
  const radius = 5 + (s % 5);
  const x = Math.cos(angle) * radius;
  const y = ((s % 7) - 3) * 0.7;
  const z = -3 - ((s % 9) * 0.4);
  const ry = ((s % 21) - 10) * 0.04;
  return { position: [x, y, z], rotation: [0, ry, 0], scale: 0.5 + ((s % 10) / 40) };
}

export function FloatingCards({ cards, onCardClick }: Props) {
  const placed = useMemo(
    () => cards.map((c, i) => ({ card: c, ...placement(c.id, i) })),
    [cards]
  );

  return (
    <>
      {placed.map(({ card, position, rotation, scale }) => (
        <Float key={card.id} speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
          <Card3D
            card={card}
            position={position}
            rotation={rotation}
            scale={scale}
            onClick={() => onCardClick(card)}
          />
        </Float>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add components/scene/FloatingCards.tsx
git commit -m "feat(3d): add FloatingCards (background arrangement)"
```

---

## Task 18: WEEK mode — arc layout

**Files:**
- Create: `components/scene/WeekCardsArc.tsx`

- [ ] **Step 1: Create components/scene/WeekCardsArc.tsx**

```tsx
"use client";

import { Card3D } from "./Card3D";
import type { CardData } from "../CardItem";

interface Props {
  cards: CardData[];
  onCardClick: (card: CardData) => void;
}

/**
 * Lay cards on a horizontal arc facing the camera in WEEK mode.
 * Up to ~21 cards (7 days × 3 columns).
 */
export function WeekCardsArc({ cards, onCardClick }: Props) {
  const radius = 9;
  const arcSpan = Math.PI * 1.1; // ~200°
  const cols = ["todo", "doing", "done"] as const;

  return (
    <>
      {cards.map((c, i) => {
        const colIndex = cols.indexOf(c.column as (typeof cols)[number]);
        const y = colIndex >= 0 ? (1 - colIndex) * 2.2 : 0; // todo top, done bottom
        const sameColCards = cards.filter((x) => x.column === c.column);
        const localIndex = sameColCards.findIndex((x) => x.id === c.id);
        const t = sameColCards.length > 1 ? localIndex / (sameColCards.length - 1) : 0.5;
        const angle = -arcSpan / 2 + t * arcSpan;
        const x = Math.sin(angle) * radius;
        const z = -Math.cos(angle) * radius + 4;
        const ry = -angle;
        return (
          <Card3D
            key={c.id}
            card={c}
            position={[x, y, z]}
            rotation={[0, ry, 0]}
            scale={0.7}
            onClick={() => onCardClick(c)}
          />
        );
      })}
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add components/scene/WeekCardsArc.tsx
git commit -m "feat(3d): add WeekCardsArc layout"
```

---

## Task 19: GSAP camera-mode hook

**Files:**
- Create: `components/scene/useCameraMode.ts`

- [ ] **Step 1: Create components/scene/useCameraMode.ts**

```ts
"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";

export type CameraMode = "today" | "week";

const POSITIONS: Record<CameraMode, [number, number, number]> = {
  today: [0, 0, 6.5],
  week:  [0, 1.5, 14],
};

const LOOK_AT: Record<CameraMode, [number, number, number]> = {
  today: [0, 0, 0],
  week:  [0, 0, 0],
};

export function useCameraMode(mode: CameraMode) {
  const { camera } = useThree();
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const lookAtRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    tweenRef.current?.kill();
    const target = POSITIONS[mode];
    const lookTarget = LOOK_AT[mode];

    tweenRef.current = gsap.to(camera.position, {
      x: target[0],
      y: target[1],
      z: target[2],
      duration: 0.9,
      ease: "power3.inOut",
    });
    gsap.to(lookAtRef.current, {
      x: lookTarget[0],
      y: lookTarget[1],
      z: lookTarget[2],
      duration: 0.9,
      ease: "power3.inOut",
      onUpdate: () => {
        camera.lookAt(lookAtRef.current.x, lookAtRef.current.y, lookAtRef.current.z);
      },
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [mode, camera]);
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add components/scene/useCameraMode.ts
git commit -m "feat(3d): add GSAP camera mode hook"
```

---

## Task 20: Dashboard client (Scene + mode toggle + modal)

**Files:**
- Create: `app/(auth)/DashboardClient.tsx`

- [ ] **Step 1: Create app/(auth)/DashboardClient.tsx**

```tsx
"use client";

import { useState } from "react";
import { useIsMobile } from "@/lib/isMobile";
import { MobileFallback } from "@/components/MobileFallback";
import { Scene } from "@/components/scene/Scene";
import { TodayCard } from "@/components/scene/TodayCard";
import { FloatingCards } from "@/components/scene/FloatingCards";
import { WeekCardsArc } from "@/components/scene/WeekCardsArc";
import { useCameraMode, type CameraMode } from "@/components/scene/useCameraMode";
import { SceneErrorBoundary } from "@/components/scene/SceneErrorBoundary";
import { CardModal } from "@/components/CardModal";
import type { CardData } from "@/components/CardItem";

interface Props {
  weekStartIso: string;
  weekCards: CardData[];
  todayCardId: string | null;
  unresolvedIssues: { id: string; title: string }[];
}

function CameraMover({ mode }: { mode: CameraMode }) {
  useCameraMode(mode);
  return null;
}

export function DashboardClient({ weekCards, todayCardId, unresolvedIssues }: Props) {
  const isMobile = useIsMobile();
  const [forceDesktop, setForceDesktop] = useState(false);
  const [mode, setMode] = useState<CameraMode>("today");
  const [editing, setEditing] = useState<CardData | null>(null);

  const todayCard = weekCards.find((c) => c.id === todayCardId) ?? null;
  const otherCards = weekCards.filter((c) => c.id !== todayCardId);

  if (isMobile && !forceDesktop) {
    return (
      <div className="space-y-3">
        <div className="flex justify-end">
          <button
            onClick={() => setForceDesktop(true)}
            className="text-xs text-neutral-400 underline hover:text-neutral-600"
          >
            3D 강제 보기
          </button>
        </div>
        <MobileFallback todayCard={todayCard} weekCards={weekCards} />
      </div>
    );
  }

  const fallback = (
    <div className="space-y-3">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        3D 렌더 실패. 2D 보기로 전환합니다.
      </div>
      <MobileFallback todayCard={todayCard} weekCards={weekCards} />
    </div>
  );

  return (
    <SceneErrorBoundary fallback={fallback}>
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {mode === "today" ? "오늘" : "이번 주"}
          </h1>
          <button
            onClick={() => setMode(mode === "today" ? "week" : "today")}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            {mode === "today" ? "이번 주 보기" : "오늘로 돌아가기"}
          </button>
        </div>
        <Scene>
          <CameraMover mode={mode} />
          {mode === "today" ? (
            <>
              <TodayCard card={todayCard} onClick={() => todayCard && setEditing(todayCard)} />
              <FloatingCards cards={otherCards} onCardClick={(c) => setEditing(c)} />
            </>
          ) : (
            <WeekCardsArc cards={weekCards} onCardClick={(c) => setEditing(c)} />
          )}
        </Scene>
        <CardModal
          card={editing}
          onClose={() => setEditing(null)}
          unresolvedIssues={unresolvedIssues}
        />
      </div>
    </SceneErrorBoundary>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add 'app/(auth)/DashboardClient.tsx'
git commit -m "feat(3d): add DashboardClient with mode toggle"
```

---

## Task 21: New / page (replaces redirect)

**Files:**
- Modify: `app/page.tsx` (delete)
- Create: `app/(auth)/page.tsx`

- [ ] **Step 1: Delete the old redirect at app/page.tsx**

```bash
rm app/page.tsx
```

The old file did `redirect("/board")`. With the new layout, `/` should be the dashboard instead.

- [ ] **Step 2: Create app/(auth)/page.tsx**

```tsx
import { prisma } from "@/lib/db";
import { getWeekStart } from "@/lib/week";
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

  return (
    <DashboardClient
      weekStartIso={weekStart.toISOString()}
      weekCards={cardData}
      todayCardId={today?.id ?? null}
      unresolvedIssues={unresolvedIssues}
    />
  );
}
```

- [ ] **Step 3: Run full build + start**

```bash
npm run build
```

Expected: routes include `/`, `/board`, `/issues`, `/timeline`, `/login`. `/` should now use the dashboard.

- [ ] **Step 4: Commit**

```bash
git add -A app/page.tsx 'app/(auth)/page.tsx'
git commit -m "feat(3d): replace / redirect with 3D dashboard"
```

---

## Task 22: Update README with new features + checklist

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Append to README.md**

Append a new section after the existing "기술 스택" section:

```markdown

## v2 추가 기능 (2026-06)

### 3D 메인 대시보드 (`/`)
- "오늘" 카드 중앙 큰 카드 + 부유하는 주변 카드
- 우상단 "이번 주 보기" 버튼: GSAP 으로 카메라가 뒤로 빠지며 주간 카드들이 호로 펼쳐짐
- 모바일 (or 좁은 화면) → 자동으로 2D 폴백. 우상단 "3D 강제 보기" 로 우회 가능
- WebGL 미지원 / 렌더 실패 시 자동 2D 폴백

### 이슈 트래커 (`/issues`)
- 월간 캘린더에 이슈가 점으로 표시 (우선순위별 색)
- 날짜 클릭 → 그 날 이슈 리스트
- "+ 새 이슈" 로 등록. 카드와 연결 가능 (선택)

### Card ↔ Issue 링크
- 보드에서 카드 모달 열면 "연결 이슈" 셀렉트로 이번 달 미해결 이슈 선택 가능

## v2 수동 테스트 체크리스트

```bash
rm -f prisma/dev.db
npx prisma db push
npm run build && npm start
```

- [ ] `/` 진입 → 3D 메인 (오늘 카드 큰 거 1장 + 주변 부유)
- [ ] 카드 추가 (`/board` 가서) → `/` 돌아오면 반영
- [ ] "이번 주 보기" 버튼 → 카메라 줌아웃, 카드 호로 펼쳐짐
- [ ] "오늘로 돌아가기" → 다시 줌인
- [ ] 카드 hover → 살짝 앞으로
- [ ] 카드 클릭 → CardModal 열림, 수정/삭제 동작
- [ ] CardModal 의 "연결 이슈" 드롭다운 → 이슈 연결 → 저장 → 다시 열면 유지
- [ ] `/issues` 진입 → 달력 + 사이드바
- [ ] 날짜 클릭 → 사이드바 그 날 이슈만
- [ ] "+ 새 이슈" → 모달 → 등록 → 달력에 점 생김
- [ ] 이슈 클릭 → 수정/삭제 동작
- [ ] 화면 폭 좁히면 (700px 이하) MobileFallback 으로 자동 전환
- [ ] "3D 강제 보기" 클릭 → 좁은 폭에서도 3D 표시
- [ ] WebGL 끄고 (devtools) 진입 → 에러 폴백 메시지 + 2D 리스트
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document v2 features (3D dashboard, issues, link)"
```

---

## Self-Review Checklist (planner — already verified)

- **Spec coverage**:
  - §4 3D dashboard → T13-T21 (Scene, Card3D, TodayCard, FloatingCards, WeekCardsArc, camera, dashboard client, page)
  - §5 Issue tracker → T1, T2, T5-T9
  - §6 Card↔Issue link → T3, T11
  - §7 Tech stack → T5 (react-day-picker), T12 (three/r3f/drei/gsap)
  - §10 Mobile fallback → T13 (helper), T20 (used in DashboardClient)
  - §11 Performance: `dpr={[1, 1.5]}`, particles count limited
  - §12 Error handling: SceneErrorBoundary in T14, used T20
  - §14 Tests: lib/today.ts has tests (T4)
- **Type consistency**: `CardData` is the canonical shape (extended in T11 with optional `linkedIssue`); Issue priority/status literal unions are used consistently across T2, T7, T8, T9, T11
- **No placeholders**: every step has concrete code or a single concrete action
- **Tasks per spec**: 22 tasks, average 3-5 steps each, each commit produces working software (except mid-plan T10 nav links to /, which gets created in T21 — acceptable for a single-day plan execution)

