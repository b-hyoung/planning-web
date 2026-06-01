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
