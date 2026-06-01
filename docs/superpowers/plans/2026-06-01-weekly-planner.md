# Weekly Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user weekly kanban planner with personal/work color tags, week navigation, drag-and-drop card management, and a completed-cards timeline retrospective view.

**Architecture:** Next.js 15 App Router monolith. Server Actions handle all mutations against a SQLite database via Prisma. iron-session cookie holds the auth state, validated against an env-var password. Client components stay small — useState for local UI, @dnd-kit for drag interactions, no Redux.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v3, Prisma + SQLite, iron-session, @dnd-kit/core, Vitest (for week helper), date-fns.

**Spec:** `docs/superpowers/specs/2026-06-01-weekly-planner-design.md`

---

## File Structure

Files this plan creates (everything under `/Users/bobs/Desktop/bobs_project/planning_web/`):

```
package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.js, .env.local, .env.example, vitest.config.ts
prisma/schema.prisma
lib/
  db.ts                # Prisma singleton
  auth.ts              # iron-session config + getSession()
  week.ts              # date helpers (TDD)
  week.test.ts
app/
  globals.css
  layout.tsx
  page.tsx             # redirect → /board
  login/
    page.tsx           # login form (client)
    actions.ts         # loginAction, logoutAction
  (auth)/
    layout.tsx         # session check + logout button
    board/
      page.tsx         # server component, fetch cards
      BoardClient.tsx  # client wrapper for DnD + state
    timeline/
      page.tsx
  actions/
    cards.ts           # createCard, updateCard, deleteCard, reorderCards
components/
  Column.tsx
  CardItem.tsx
  CardModal.tsx
  WeekPicker.tsx
  TagFilter.tsx
  AddCardForm.tsx
  Toast.tsx            # simple toast for errors
```

Each `lib/` file has one responsibility. Each component file has one component. Server actions group by domain (auth vs cards).

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Run create-next-app**

The repo root already exists with `docs/` and `.gitignore`. Run scaffold in-place:

```bash
cd /Users/bobs/Desktop/bobs_project/planning_web
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --no-eslint --import-alias "@/*" --use-npm --yes
```

Expected: tool may prompt about existing files (`.gitignore`, `docs/`). When asked, choose to keep existing or merge. If it refuses to scaffold in non-empty dir, scaffold into a temp dir then move files:

```bash
cd /tmp && npx create-next-app@latest planning-tmp --typescript --tailwind --app --no-src-dir --no-eslint --import-alias "@/*" --use-npm --yes
rsync -av --exclude='.git' --exclude='.gitignore' /tmp/planning-tmp/ /Users/bobs/Desktop/bobs_project/planning_web/
rm -rf /tmp/planning-tmp
```

Then merge generated `.gitignore` entries into existing `.gitignore` (do not overwrite — existing has `.superpowers/`, `prisma/dev.db`).

- [ ] **Step 2: Verify dev server boots**

```bash
cd /Users/bobs/Desktop/bobs_project/planning_web
npm run dev
```

Expected: server starts on http://localhost:3000, default Next.js page renders. Stop server (Ctrl+C).

- [ ] **Step 3: Replace default app/page.tsx with redirect**

Overwrite `app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/board");
}
```

- [ ] **Step 4: Simplify app/layout.tsx**

Overwrite `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "주간 플래너",
  description: "1인용 주간 칸반 플래너",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-neutral-50 text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Clean globals.css**

Overwrite `app/globals.css` to keep only Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: scaffold Next.js 15 app with Tailwind"
```

---

## Task 2: Install runtime dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Prisma, iron-session, dnd-kit, date-fns**

```bash
cd /Users/bobs/Desktop/bobs_project/planning_web
npm install @prisma/client iron-session @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities date-fns
npm install -D prisma vitest @vitest/ui
```

Expected: dependencies added to `package.json`, no errors.

- [ ] **Step 2: Add scripts**

Edit `package.json` `scripts` to include:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "vitest run",
  "test:watch": "vitest",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install runtime + dev dependencies"
```

---

## Task 3: Set up Prisma schema and SQLite

**Files:**
- Create: `prisma/schema.prisma`, `lib/db.ts`
- Create: `.env.local`, `.env.example`

- [ ] **Step 1: Create prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
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

  @@index([weekStart])
  @@index([completedAt])
}
```

- [ ] **Step 2: Create .env.local and .env.example**

`.env.local`:

```
DATABASE_URL="file:./dev.db"
APP_PASSWORD="changeme"
SESSION_SECRET="please-generate-a-32-byte-random-string-here-xxxxx"
```

`.env.example`:

```
DATABASE_URL="file:./dev.db"
APP_PASSWORD="your-login-password"
SESSION_SECRET="32-byte-random-string-for-cookie-encryption"
```

- [ ] **Step 3: Generate Prisma client and run initial db push**

```bash
cd /Users/bobs/Desktop/bobs_project/planning_web
npx prisma db push
```

Expected: `dev.db` created in `prisma/`, Prisma client generated in `node_modules/@prisma/client`.

- [ ] **Step 4: Create lib/db.ts (Prisma singleton)**

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma lib/db.ts .env.example
git commit -m "feat: add Prisma schema and SQLite setup"
```

(`.env.local` is gitignored — do not commit.)

---

## Task 4: Week helper utilities (TDD)

**Files:**
- Create: `lib/week.ts`, `lib/week.test.ts`, `vitest.config.ts`

- [ ] **Step 1: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
```

- [ ] **Step 2: Write failing tests in lib/week.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { getWeekStart, formatWeekLabel, addWeeks, parseWeekParam } from "./week";

describe("getWeekStart", () => {
  it("returns Monday 00:00 for a Wednesday", () => {
    // Wednesday June 3, 2026
    const d = new Date("2026-06-03T15:30:00Z");
    const start = getWeekStart(d);
    expect(start.toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });

  it("returns the same day for a Monday at midnight", () => {
    const d = new Date("2026-06-01T00:00:00Z");
    expect(getWeekStart(d).toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });

  it("rolls back across month boundary", () => {
    // Tuesday Sep 1, 2026 → Monday Aug 31
    const d = new Date("2026-09-01T10:00:00Z");
    expect(getWeekStart(d).toISOString()).toBe("2026-08-31T00:00:00.000Z");
  });

  it("treats Sunday as the last day of the previous Monday-week", () => {
    // Sunday June 7, 2026 → Monday June 1
    const d = new Date("2026-06-07T20:00:00Z");
    expect(getWeekStart(d).toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });
});

describe("addWeeks", () => {
  it("moves forward 1 week", () => {
    const d = new Date("2026-06-01T00:00:00Z");
    expect(addWeeks(d, 1).toISOString()).toBe("2026-06-08T00:00:00.000Z");
  });

  it("moves back 2 weeks", () => {
    const d = new Date("2026-06-15T00:00:00Z");
    expect(addWeeks(d, -2).toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });
});

describe("formatWeekLabel", () => {
  it("returns 'M월 D일 주' style label", () => {
    const d = new Date("2026-06-01T00:00:00Z");
    expect(formatWeekLabel(d)).toBe("2026년 6월 1일 주");
  });
});

describe("parseWeekParam", () => {
  it("returns weekStart for a valid ISO date string", () => {
    expect(parseWeekParam("2026-06-03")?.toISOString()).toBe(
      "2026-06-01T00:00:00.000Z"
    );
  });

  it("returns null for invalid input", () => {
    expect(parseWeekParam("not-a-date")).toBeNull();
    expect(parseWeekParam(undefined)).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npm test
```

Expected: FAIL — `lib/week.ts` does not exist.

- [ ] **Step 4: Implement lib/week.ts**

```ts
export function getWeekStart(date: Date): Date {
  const d = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  const day = d.getUTCDay(); // 0=Sun ... 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function addWeeks(weekStart: Date, weeks: number): Date {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return d;
}

export function formatWeekLabel(weekStart: Date): string {
  const y = weekStart.getUTCFullYear();
  const m = weekStart.getUTCMonth() + 1;
  const d = weekStart.getUTCDate();
  return `${y}년 ${m}월 ${d}일 주`;
}

export function parseWeekParam(param: string | undefined | null): Date | null {
  if (!param) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(param);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (isNaN(date.getTime())) return null;
  return getWeekStart(date);
}

export function toWeekParam(weekStart: Date): string {
  const y = weekStart.getUTCFullYear();
  const m = String(weekStart.getUTCMonth() + 1).padStart(2, "0");
  const d = String(weekStart.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const DAY_LABELS_KO = ["월", "화", "수", "목", "금", "토", "일"];
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test
```

Expected: PASS (all 9 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/week.ts lib/week.test.ts vitest.config.ts
git commit -m "feat: add week helper utilities with tests"
```

---

## Task 5: iron-session auth helper

**Files:**
- Create: `lib/auth.ts`

- [ ] **Step 1: Create lib/auth.ts**

```ts
import { cookies } from "next/headers";
import { getIronSession, SessionOptions } from "iron-session";

export interface SessionData {
  loggedIn?: boolean;
}

function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return {
    password,
    cookieName: "wp_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions());
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session.loggedIn;
}

export function getAppPassword(): string {
  const pw = process.env.APP_PASSWORD;
  if (!pw) throw new Error("APP_PASSWORD env var not set");
  return pw;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth.ts
git commit -m "feat: add iron-session auth helper"
```

---

## Task 6: Login page and auth actions

**Files:**
- Create: `app/login/page.tsx`, `app/login/actions.ts`

- [ ] **Step 1: Create app/login/actions.ts**

```ts
"use server";

import { redirect } from "next/navigation";
import { getSession, getAppPassword } from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const input = String(formData.get("password") ?? "");
  if (input !== getAppPassword()) {
    return { error: "비밀번호가 틀렸어요." };
  }
  const session = await getSession();
  session.loggedIn = true;
  await session.save();
  redirect("/board");
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
```

- [ ] **Step 2: Create app/login/page.tsx**

```tsx
"use client";

import { useState, useTransition } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await loginAction(formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        action={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold">주간 플래너</h1>
        <p className="text-sm text-neutral-500">비밀번호를 입력해주세요.</p>
        <input
          type="password"
          name="password"
          autoFocus
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "확인 중..." : "들어가기"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Manually verify login**

```bash
npm run dev
```

Open http://localhost:3000/login. Type wrong password → error. Type "changeme" (the env value) → redirected to /board (which 404s for now — that's expected).

- [ ] **Step 4: Commit**

```bash
git add app/login
git commit -m "feat: add login page and auth actions"
```

---

## Task 7: Auth-protected layout

**Files:**
- Create: `app/(auth)/layout.tsx`

- [ ] **Step 1: Create app/(auth)/layout.tsx**

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { logoutAction } from "../login/actions";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/board" className="font-semibold">주간 플래너</Link>
            <Link href="/board" className="text-neutral-600 hover:text-neutral-900">보드</Link>
            <Link href="/timeline" className="text-neutral-600 hover:text-neutral-900">회고</Link>
          </nav>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-900">
              로그아웃
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(auth\)/layout.tsx
git commit -m "feat: add auth-protected layout with nav"
```

---

## Task 8: Card Server Actions

**Files:**
- Create: `app/actions/cards.ts`

- [ ] **Step 1: Create app/actions/cards.ts**

```ts
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
  } else if (patch.column && patch.column !== "done") {
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
```

- [ ] **Step 2: Commit**

```bash
git add app/actions/cards.ts
git commit -m "feat: add card Server Actions"
```

---

## Task 9: Week picker component

**Files:**
- Create: `components/WeekPicker.tsx`

- [ ] **Step 1: Create components/WeekPicker.tsx**

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  addWeeks,
  formatWeekLabel,
  parseWeekParam,
  toWeekParam,
  getWeekStart,
} from "@/lib/week";

export function WeekPicker() {
  const router = useRouter();
  const params = useSearchParams();
  const current = parseWeekParam(params.get("week")) ?? getWeekStart(new Date());

  function go(weekStart: Date) {
    const next = new URLSearchParams(params.toString());
    next.set("week", toWeekParam(weekStart));
    router.push(`/board?${next.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => go(addWeeks(current, -1))}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-100"
        aria-label="이전 주"
      >
        ←
      </button>
      <button
        onClick={() => go(getWeekStart(new Date()))}
        className="rounded-md border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
      >
        이번 주
      </button>
      <button
        onClick={() => go(addWeeks(current, 1))}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-100"
        aria-label="다음 주"
      >
        →
      </button>
      <span className="ml-3 text-base font-medium">{formatWeekLabel(current)}</span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/WeekPicker.tsx
git commit -m "feat: add WeekPicker component"
```

---

## Task 10: Tag filter component

**Files:**
- Create: `components/TagFilter.tsx`

- [ ] **Step 1: Create components/TagFilter.tsx**

```tsx
"use client";

export type TagFilterValue = "all" | "personal" | "work";

interface Props {
  value: TagFilterValue;
  onChange: (v: TagFilterValue) => void;
}

const OPTIONS: { value: TagFilterValue; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "personal", label: "개인" },
  { value: "work", label: "업무" },
];

export function TagFilter({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-md border border-neutral-300 bg-white p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={
            "rounded px-3 py-1 text-sm transition " +
            (value === opt.value
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-100")
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TagFilter.tsx
git commit -m "feat: add TagFilter component"
```

---

## Task 11: AddCardForm component

**Files:**
- Create: `components/AddCardForm.tsx`

- [ ] **Step 1: Create components/AddCardForm.tsx**

```tsx
"use client";

import { useState, useTransition } from "react";
import { createCard } from "@/app/actions/cards";

interface Props {
  weekStart: string; // ISO
}

export function AddCardForm({ weekStart }: Props) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState<"personal" | "work">("work");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      try {
        await createCard({ title, tag, weekStart });
        setTitle("");
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={submit} className="mb-4 flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="할 일 추가..."
        className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
      />
      <select
        value={tag}
        onChange={(e) => setTag(e.target.value as "personal" | "work")}
        className="rounded-lg border border-neutral-300 px-2 py-2 text-sm"
      >
        <option value="work">업무</option>
        <option value="personal">개인</option>
      </select>
      <button
        type="submit"
        disabled={pending || !title.trim()}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        추가
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/AddCardForm.tsx
git commit -m "feat: add AddCardForm component"
```

---

## Task 12: CardItem and CardModal components

**Files:**
- Create: `components/CardItem.tsx`, `components/CardModal.tsx`

- [ ] **Step 1: Create components/CardItem.tsx**

```tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DAY_LABELS_KO } from "@/lib/week";

export interface CardData {
  id: string;
  title: string;
  memo: string | null;
  dueDay: number | null;
  tag: string;
  column: string;
}

interface Props {
  card: CardData;
  onClick: () => void;
}

const TAG_STYLES: Record<string, { border: string; chip: string }> = {
  work:     { border: "border-l-blue-500",  chip: "bg-blue-100 text-blue-700" },
  personal: { border: "border-l-green-500", chip: "bg-green-100 text-green-700" },
};

export function CardItem({ card, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const tagStyle = TAG_STYLES[card.tag] ?? TAG_STYLES.work;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={
        "mb-2 cursor-pointer rounded-lg border border-neutral-200 border-l-4 " +
        tagStyle.border +
        " bg-white p-3 shadow-sm hover:shadow"
      }
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-neutral-900">{card.title}</span>
        {card.dueDay !== null && (
          <span className={"shrink-0 rounded px-1.5 py-0.5 text-[10px] " + tagStyle.chip}>
            {DAY_LABELS_KO[card.dueDay]}
          </span>
        )}
      </div>
      {card.memo && (
        <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{card.memo}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create components/CardModal.tsx**

```tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { updateCard, deleteCard } from "@/app/actions/cards";
import { DAY_LABELS_KO } from "@/lib/week";
import type { CardData } from "./CardItem";

interface Props {
  card: CardData | null;
  onClose: () => void;
}

export function CardModal({ card, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dueDay, setDueDay] = useState<number | null>(null);
  const [tag, setTag] = useState<"personal" | "work">("work");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setMemo(card.memo ?? "");
      setDueDay(card.dueDay);
      setTag(card.tag as "personal" | "work");
    }
  }, [card]);

  if (!card) return null;

  function save() {
    startTransition(async () => {
      try {
        await updateCard(card!.id, { title, memo: memo || null, dueDay, tag });
        onClose();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  function remove() {
    if (!confirm("이 카드를 삭제할까요?")) return;
    startTransition(async () => {
      await deleteCard(card!.id);
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
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base font-medium focus:border-neutral-900 focus:outline-none"
        />
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모..."
          rows={4}
          className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
        <div className="flex gap-3">
          <label className="flex-1">
            <span className="mb-1 block text-xs text-neutral-500">태그</span>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value as "personal" | "work")}
              className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="work">업무</option>
              <option value="personal">개인</option>
            </select>
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs text-neutral-500">마감 요일</span>
            <select
              value={dueDay ?? ""}
              onChange={(e) =>
                setDueDay(e.target.value === "" ? null : Number(e.target.value))
              }
              className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="">미지정</option>
              {DAY_LABELS_KO.map((label, i) => (
                <option key={i} value={i}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex justify-between pt-2">
          <button
            onClick={remove}
            disabled={pending}
            className="text-sm text-red-600 hover:underline disabled:opacity-50"
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

- [ ] **Step 3: Commit**

```bash
git add components/CardItem.tsx components/CardModal.tsx
git commit -m "feat: add CardItem and CardModal components"
```

---

## Task 13: Column component

**Files:**
- Create: `components/Column.tsx`

- [ ] **Step 1: Create components/Column.tsx**

```tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CardItem, type CardData } from "./CardItem";

interface Props {
  id: "todo" | "doing" | "done";
  title: string;
  cards: CardData[];
  onCardClick: (card: CardData) => void;
}

export function Column({ id, title, cards, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={
        "flex flex-col rounded-xl border bg-neutral-100/50 p-3 transition " +
        (isOver ? "border-neutral-400 bg-neutral-100" : "border-neutral-200")
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700">{title}</h2>
        <span className="text-xs text-neutral-500">{cards.length}</span>
      </div>
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[60px]">
          {cards.map((card) => (
            <CardItem key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Column.tsx
git commit -m "feat: add Column component"
```

---

## Task 14: Board page (server) + client wrapper with DnD

**Files:**
- Create: `app/(auth)/board/page.tsx`, `app/(auth)/board/BoardClient.tsx`

- [ ] **Step 1: Create app/(auth)/board/page.tsx (server component)**

```tsx
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
```

- [ ] **Step 2: Create app/(auth)/board/BoardClient.tsx**

```tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { WeekPicker } from "@/components/WeekPicker";
import { TagFilter, type TagFilterValue } from "@/components/TagFilter";
import { AddCardForm } from "@/components/AddCardForm";
import { Column } from "@/components/Column";
import { CardModal } from "@/components/CardModal";
import type { CardData } from "@/components/CardItem";
import { reorderCards, updateCard } from "@/app/actions/cards";

interface Props {
  weekStartIso: string;
  initialCards: CardData[];
}

type ColumnId = "todo" | "doing" | "done";
const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "todo", title: "할 일" },
  { id: "doing", title: "진행 중" },
  { id: "done", title: "완료" },
];

export function BoardClient({ weekStartIso, initialCards }: Props) {
  const [cards, setCards] = useState<CardData[]>(initialCards);
  const [filter, setFilter] = useState<TagFilterValue>("all");
  const [editing, setEditing] = useState<CardData | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Sync when server data changes (e.g. after add)
  // initialCards is a new array reference on each parent re-render.
  // We keep local state for drag responsiveness but reset when initialCards changes:
  useMemoSync(initialCards, setCards);

  const visible = useMemo(
    () => (filter === "all" ? cards : cards.filter((c) => c.tag === filter)),
    [cards, filter]
  );

  const byColumn = useMemo(() => {
    const map: Record<ColumnId, CardData[]> = { todo: [], doing: [], done: [] };
    for (const c of visible) map[c.column as ColumnId]?.push(c);
    return map;
  }, [visible]);

  function findColumn(cardId: string): ColumnId | null {
    const c = cards.find((c) => c.id === cardId);
    return (c?.column as ColumnId) ?? null;
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const fromCol = findColumn(activeId);
    if (!fromCol) return;

    // Drop on a column (empty area) → move to end of that column
    const toCol: ColumnId =
      (["todo", "doing", "done"] as ColumnId[]).includes(overId as ColumnId)
        ? (overId as ColumnId)
        : findColumn(overId) ?? fromCol;

    const previous = cards;
    let next: CardData[];

    if (fromCol === toCol) {
      // Reorder within column
      const colCards = byColumn[fromCol];
      const oldIndex = colCards.findIndex((c) => c.id === activeId);
      const newIndex = colCards.findIndex((c) => c.id === overId);
      if (oldIndex < 0 || newIndex < 0) return;
      const newOrder = arrayMove(colCards, oldIndex, newIndex);
      next = cards.map((c) => {
        if (c.column !== fromCol) return c;
        const idx = newOrder.findIndex((n) => n.id === c.id);
        return idx === -1 ? c : { ...newOrder[idx] };
      });

      setCards(next);
      const orderedIds = newOrder.map((c) => c.id);
      startTransition(async () => {
        try {
          await reorderCards(fromCol, orderedIds);
        } catch {
          setCards(previous);
          alert("순서 저장 실패");
        }
      });
    } else {
      // Move across columns
      next = cards.map((c) => (c.id === activeId ? { ...c, column: toCol } : c));
      setCards(next);
      startTransition(async () => {
        try {
          await updateCard(activeId, { column: toCol });
          // Then reorder the destination column to include the moved card at the end:
          const destIds = next.filter((c) => c.column === toCol).map((c) => c.id);
          await reorderCards(toCol, destIds);
        } catch {
          setCards(previous);
          alert("이동 저장 실패");
        }
      });
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <WeekPicker />
        <TagFilter value={filter} onChange={setFilter} />
      </div>
      <AddCardForm weekStart={weekStartIso} />
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              cards={byColumn[col.id]}
              onCardClick={(card) => setEditing(card)}
            />
          ))}
        </div>
      </DndContext>
      <CardModal card={editing} onClose={() => setEditing(null)} />
    </>
  );
}

// Re-sync local state when server data refreshes (after revalidatePath)
import { useEffect, useRef } from "react";
function useMemoSync(initial: CardData[], setCards: (c: CardData[]) => void) {
  const prev = useRef(initial);
  useEffect(() => {
    if (prev.current !== initial) {
      prev.current = initial;
      setCards(initial);
    }
  }, [initial, setCards]);
}
```

- [ ] **Step 3: Manually verify the board**

```bash
npm run dev
```

Open http://localhost:3000/login, log in, you should land on `/board`. Try:
- Add a card → appears in 할 일
- Drag card between columns → moves and persists across reload
- Reorder within column → order persists
- Click a card → modal opens, edit/save/delete works
- Switch week with arrows → cards filter to that week
- Filter by 개인/업무

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/board
git commit -m "feat: add kanban board with drag-and-drop"
```

---

## Task 15: Timeline page

**Files:**
- Create: `app/(auth)/timeline/page.tsx`

- [ ] **Step 1: Create app/(auth)/timeline/page.tsx**

```tsx
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
```

- [ ] **Step 2: Manually verify timeline**

Open http://localhost:3000/timeline. Complete a couple of cards in /board first by dragging them to 완료. They should appear grouped by date.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/timeline
git commit -m "feat: add timeline retrospective page"
```

---

## Task 16: Final manual test pass + README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Walk through the full happy path**

Start fresh:
```bash
rm -f prisma/dev.db
npx prisma db push
npm run dev
```

Checklist:
- [ ] Visit `/` → redirects to `/login`
- [ ] Wrong password → error
- [ ] Right password → lands on `/board`
- [ ] Add 3 cards (mix of 개인/업무 tags, mix of dueDay)
- [ ] Drag one to 진행 중, another to 완료
- [ ] Click a 완료 card → confirm color border + edit modal opens
- [ ] Edit a card title and save → persists on reload
- [ ] Delete a card → gone after reload
- [ ] Filter 개인 → only personal cards visible
- [ ] Filter 업무 → only work cards visible
- [ ] Filter 전체 → all visible
- [ ] Click → arrow → cards disappear (next week empty)
- [ ] Click ← back → cards reappear
- [ ] Click "이번 주" → jumps back to current week
- [ ] Navigate to /timeline → completed card grouped under today
- [ ] Drag completed card back to 진행 중 → disappears from timeline on reload
- [ ] Logout → redirected to /login

- [ ] **Step 2: Create README.md**

```markdown
# Weekly Planner

1인용 주간 칸반 플래너. Next.js + SQLite + Prisma.

## 실행

```bash
cp .env.example .env.local
# .env.local 의 APP_PASSWORD, SESSION_SECRET 를 채워주세요
npm install
npx prisma db push
npm run dev
```

브라우저: http://localhost:3000

## 명령어

- `npm run dev` — 개발 서버
- `npm run build && npm start` — 프로덕션 모드
- `npm test` — 단위 테스트 (week 헬퍼)
- `npm run db:studio` — Prisma Studio (DB GUI)

## 데이터 백업

`prisma/dev.db` 파일을 복사해두면 됩니다.

## 환경 변수

- `APP_PASSWORD` — 로그인 비밀번호 (평문)
- `SESSION_SECRET` — 32바이트 이상 랜덤 문자열 (쿠키 암호화)
- `DATABASE_URL` — `file:./dev.db`
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add README with run instructions"
```

---

## Self-Review Checklist (executor: skip — already verified by planner)

- ✅ Spec coverage: 로그인(T6), 주차 선택(T9), 칸반 보드(T13/T14), 카드 CRUD(T8/T11/T12), 태그 필터(T10), 회고 타임라인(T15)
- ✅ No TBD/placeholder steps
- ✅ Type consistency: `CardData` shape is reused across CardItem / CardModal / Column / BoardClient; column literals are `"todo" | "doing" | "done"` throughout
- ✅ Server Actions revalidate the right paths (`/board`, `/timeline`)
- ✅ Auth gate present in `(auth)/layout.tsx` and in every mutating action via `requireAuth()`
