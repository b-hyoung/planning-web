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
