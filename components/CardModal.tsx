"use client";

import { useState, useTransition, useEffect } from "react";
import { updateCard, deleteCard, linkIssueToCard } from "@/app/actions/cards";
import { DAY_LABELS_KO } from "@/lib/week";
import type { CardData } from "./CardItem";

interface Props {
  card: CardData | null;
  onClose: () => void;
  unresolvedIssues?: { id: string; title: string }[];
}

export function CardModal({ card, onClose, unresolvedIssues = [] }: Props) {
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dueDay, setDueDay] = useState<number | null>(null);
  const [tag, setTag] = useState<"personal" | "work">("work");
  const [linkingIssueId, setLinkingIssueId] = useState<string>("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setMemo(card.memo ?? "");
      setDueDay(card.dueDay);
      setTag(card.tag as "personal" | "work");
      setLinkingIssueId(card.linkedIssue?.id ?? "");
    }
  }, [card]);

  if (!card) return null;

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

  function remove() {
    if (!confirm("이 카드를 삭제할까요?")) return;
    startTransition(async () => {
      await deleteCard(card!.id);
      onClose();
    });
  }

  const linkedIssueResolved =
    card.linkedIssue &&
    !unresolvedIssues.find((i) => i.id === card.linkedIssue!.id);

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
        <div>
          <span className="mb-1 block text-xs text-neutral-500">연결 이슈</span>
          <select
            value={linkingIssueId}
            onChange={(e) => setLinkingIssueId(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
          >
            <option value="">없음</option>
            {unresolvedIssues.map((i) => (
              <option key={i.id} value={i.id}>{i.title}</option>
            ))}
            {linkedIssueResolved && (
              <option value={card.linkedIssue!.id}>
                {card.linkedIssue!.title} (해결됨)
              </option>
            )}
          </select>
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
