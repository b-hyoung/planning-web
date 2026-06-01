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
  initial: IssueData | null;
  defaultDate?: Date;
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
