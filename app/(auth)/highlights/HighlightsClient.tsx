"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface HighlightItem {
  id: string;
  sourceUrl: string;
  author: string;
  text: string;
  comments: string[];
  summary: string | null;
  tags: string[];
  postedAtIso: string | null;
  fetchedAtIso: string;
}

interface Props {
  items: HighlightItem[];
  authors: string[];
  activeAuthor: string | null;
}

type SortMode = "newest" | "oldest" | "longest";

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = now - then;
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff < hour) return `${Math.floor(diff / min)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < 30 * day) return `${Math.floor(diff / day)}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}

function highlightLength(item: HighlightItem): number {
  return item.text.length + (item.summary?.length ?? 0);
}

export function HighlightsClient({ items, authors, activeAuthor }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = items;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) =>
          i.text.toLowerCase().includes(q) ||
          (i.summary ?? "").toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    const sorted = [...list];
    if (sort === "newest") {
      sorted.sort((a, b) => {
        const ta = a.postedAtIso ?? a.fetchedAtIso;
        const tb = b.postedAtIso ?? b.fetchedAtIso;
        return new Date(tb).getTime() - new Date(ta).getTime();
      });
    } else if (sort === "oldest") {
      sorted.sort((a, b) => {
        const ta = a.postedAtIso ?? a.fetchedAtIso;
        const tb = b.postedAtIso ?? b.fetchedAtIso;
        return new Date(ta).getTime() - new Date(tb).getTime();
      });
    } else {
      sorted.sort((a, b) => highlightLength(b) - highlightLength(a));
    }
    return sorted;
  }, [items, query, sort]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">하이라이트</h1>
          <p className="mt-1 text-xs text-neutral-500">
            크롤링한 Threads 글 모음 · 총 {items.length}개
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-md border border-neutral-300 bg-white px-2 py-1.5"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="longest">긴 글순</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색..."
            className="w-44 rounded-md border border-neutral-300 bg-white px-3 py-1.5 focus:border-neutral-900 focus:outline-none"
          />
        </div>
      </div>

      {/* 작성자 필터 */}
      {authors.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href="/highlights"
            className={
              "rounded-full px-3 py-1 text-xs " +
              (!activeAuthor
                ? "bg-neutral-900 text-white"
                : "bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-100")
            }
          >
            전체
          </Link>
          {authors.map((a) => (
            <Link
              key={a}
              href={`/highlights?author=${encodeURIComponent(a)}`}
              className={
                "rounded-full px-3 py-1 text-xs " +
                (activeAuthor === a
                  ? "bg-neutral-900 text-white"
                  : "bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-100")
              }
            >
              {a}
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState hasData={items.length > 0} />
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {filtered.map((item) => {
            const expanded = expandedId === item.id;
            return (
              <article
                key={item.id}
                className={
                  "mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md " +
                  (expanded ? "ring-2 ring-neutral-900" : "")
                }
              >
                <header className="flex items-baseline justify-between gap-2 border-b border-neutral-100 bg-neutral-50/60 px-4 py-2">
                  <span className="text-xs font-semibold text-neutral-700">
                    {item.author}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {relativeTime(item.postedAtIso ?? item.fetchedAtIso)}
                  </span>
                </header>

                <div className="p-4">
                  {item.summary && (
                    <div className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                      <span className="font-semibold">요약 · </span>
                      {item.summary}
                    </div>
                  )}
                  <p
                    className={
                      "whitespace-pre-line text-sm leading-relaxed text-neutral-800 " +
                      (expanded ? "" : "line-clamp-6")
                    }
                  >
                    {item.text}
                  </p>

                  {expanded && item.comments.length > 0 && (
                    <div className="mt-3 border-t border-neutral-100 pt-3">
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                        댓글 ({item.comments.length})
                      </div>
                      <ul className="space-y-1.5">
                        {item.comments.map((c, i) => (
                          <li key={i} className="text-[12px] text-neutral-600">
                            • {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <footer className="flex items-center justify-between gap-2 border-t border-neutral-100 bg-neutral-50/60 px-4 py-2 text-[11px]">
                  <button
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                    className="font-medium text-neutral-600 hover:text-neutral-900"
                  >
                    {expanded ? "접기" : "더보기"}
                  </button>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-neutral-900"
                  >
                    원문 ↗
                  </a>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasData }: { hasData: boolean }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-10 text-center">
      {hasData ? (
        <p className="text-sm text-neutral-500">검색 결과 없음</p>
      ) : (
        <>
          <p className="text-sm text-neutral-500">아직 수집된 글이 없어요.</p>
          <pre className="mx-auto mt-4 inline-block rounded-md bg-neutral-900 px-4 py-3 text-left text-xs text-emerald-300">
            {"npm run crawl https://www.threads.com/@choi.openai"}
          </pre>
          <p className="mt-3 text-xs text-neutral-400">
            처음엔 별도 Chrome 창이 뜨면 로그인 후 엔터를 누르세요.
          </p>
        </>
      )}
    </div>
  );
}
