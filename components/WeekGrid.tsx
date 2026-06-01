"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateCard } from "@/app/actions/cards";
import { DAY_LABELS_KO } from "@/lib/week";
import { getHoliday, dateKey } from "@/lib/holidays";
import type { CardData } from "./CardItem";

export interface WeekIssue {
  id: string;
  title: string;
  reportedAtIso: string;
  priority: "low" | "med" | "high";
  status: "open" | "in_progress" | "resolved";
}

interface Props {
  weekStartIso: string;
  weekCards: CardData[];
  weekIssues: WeekIssue[];
  onCardClick: (card: CardData) => void;
}

const TAG_BAR: Record<string, string> = {
  work: "border-l-blue-500",
  personal: "border-l-green-500",
};

const PRIORITY_DOT: Record<WeekIssue["priority"], string> = {
  high: "bg-red-500",
  med: "bg-amber-500",
  low: "bg-neutral-400",
};

const DAY_IDS = ["d0", "d1", "d2", "d3", "d4", "d5", "d6", "unassigned"] as const;
type DayId = (typeof DAY_IDS)[number];

function dayIdToDueDay(id: DayId): number | null {
  if (id === "unassigned") return null;
  return parseInt(id.substring(1), 10);
}

function cardToDayId(c: CardData): DayId {
  if (c.dueDay === null) return "unassigned";
  return `d${c.dueDay}` as DayId;
}

interface DraggableCardProps {
  card: CardData;
  onClick: () => void;
}

function DraggableCard({ card, onClick }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const tagBar = TAG_BAR[card.tag] ?? "border-l-neutral-300";
  const liftedTransform = transform
    ? `${CSS.Transform.toString(transform)} ${isDragging ? "rotate(-2deg) scale(1.04)" : ""}`
    : undefined;

  const style: React.CSSProperties = {
    transform: liftedTransform,
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 30 : "auto",
    boxShadow: isDragging
      ? "0 12px 28px rgba(15, 23, 42, 0.18), 0 4px 10px rgba(15, 23, 42, 0.12)"
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={
        "mb-1.5 cursor-grab active:cursor-grabbing rounded-md border border-neutral-200 border-l-4 " +
        tagBar +
        " bg-white px-2 py-1.5 text-[11px] leading-tight shadow-sm hover:shadow " +
        (card.column === "done" ? "opacity-50 line-through" : "")
      }
    >
      <div className="truncate font-medium text-neutral-900">{card.title}</div>
      {card.column === "doing" && (
        <div className="mt-0.5 text-[9px] font-medium text-amber-600">진행 중</div>
      )}
    </div>
  );
}

interface DayColumnProps {
  id: DayId;
  header: React.ReactNode;
  isToday: boolean;
  cards: CardData[];
  issues?: WeekIssue[];
  onCardClick: (c: CardData) => void;
}

function DayColumn({ id, header, isToday, cards, issues, onCardClick }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={
        "flex flex-col rounded-lg border bg-white p-2 transition " +
        (isOver
          ? "border-neutral-900 bg-blue-50/50"
          : isToday
          ? "border-blue-300 bg-blue-50/30"
          : "border-neutral-200")
      }
    >
      <div className="mb-2 border-b border-neutral-100 pb-1.5">{header}</div>
      {issues && issues.length > 0 && (
        <div className="mb-1.5 space-y-0.5">
          {issues.map((i) => (
            <div
              key={i.id}
              className="flex items-center gap-1 rounded-sm bg-neutral-50 px-1.5 py-0.5 text-[10px] text-neutral-600"
              title={i.title}
            >
              <span
                className={
                  "h-1.5 w-1.5 shrink-0 rounded-full " +
                  PRIORITY_DOT[i.priority] +
                  (i.status === "resolved" ? " opacity-30" : "")
                }
                aria-hidden
              />
              <span className="truncate">{i.title}</span>
            </div>
          ))}
        </div>
      )}
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[80px] flex-1">
          {cards.map((card) => (
            <DraggableCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function makeCollisionDetection(getOriginId: () => DayId | null): CollisionDetection {
  return (args) => {
    const { collisionRect, droppableContainers } = args;
    const originId = getOriginId();

    if (collisionRect) {
      const dragArea =
        (collisionRect.right - collisionRect.left) *
        (collisionRect.bottom - collisionRect.top);

      if (dragArea > 0) {
        const hits = droppableContainers
          .filter((d) => DAY_IDS.includes(d.id as DayId) && d.id !== originId)
          .map((d) => {
            const r = d.rect.current;
            if (!r) return { id: d.id, ratio: 0 };
            const x = Math.max(
              0,
              Math.min(collisionRect.right, r.right) -
                Math.max(collisionRect.left, r.left),
            );
            const y = Math.max(
              0,
              Math.min(collisionRect.bottom, r.bottom) -
                Math.max(collisionRect.top, r.top),
            );
            return { id: d.id, ratio: (x * y) / dragArea };
          });
        const above = hits.filter((c) => c.ratio >= 0.5);
        if (above.length > 0) {
          above.sort((a, b) => b.ratio - a.ratio);
          return [{ id: above[0].id }];
        }
      }
    }
    return rectIntersection(args);
  };
}

export function WeekGrid({
  weekStartIso,
  weekCards: initial,
  weekIssues,
  onCardClick,
}: Props) {
  const [cards, setCards] = useState<CardData[]>(initial);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  const prevInitial = useRef(initial);
  useEffect(() => {
    if (prevInitial.current !== initial) {
      prevInitial.current = initial;
      setCards(initial);
    }
  }, [initial]);

  const weekStart = new Date(weekStartIso);

  // 7일 + 미지정
  const dayDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setUTCDate(d.getUTCDate() + i);
      return d;
    });
  }, [weekStart]);

  const todayWeekday = useMemo(() => {
    const now = new Date();
    const currentWeekStart = new Date(weekStart);
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const wsOnly = new Date(
      currentWeekStart.getUTCFullYear(),
      currentWeekStart.getUTCMonth(),
      currentWeekStart.getUTCDate(),
    );
    const diff = Math.floor((nowOnly.getTime() - wsOnly.getTime()) / 86400000);
    return diff >= 0 && diff <= 6 ? diff : -1;
  }, [weekStart]);

  const byDay = useMemo(() => {
    const map: Record<DayId, CardData[]> = {
      d0: [], d1: [], d2: [], d3: [], d4: [], d5: [], d6: [], unassigned: [],
    };
    for (const c of cards) {
      const id = cardToDayId(c);
      map[id].push(c);
    }
    return map;
  }, [cards]);

  const issuesByDay = useMemo(() => {
    const map: Record<string, WeekIssue[]> = {};
    for (const i of weekIssues) {
      const d = new Date(i.reportedAtIso);
      const k = dateKey(d);
      (map[k] ??= []).push(i);
    }
    return map;
  }, [weekIssues]);

  const dragOrigin = useRef<DayId | null>(null);
  const dragSnapshot = useRef<CardData[] | null>(null);
  const collisionDetection = useMemo(
    () => makeCollisionDetection(() => dragOrigin.current),
    [],
  );

  function findDayId(cardId: string): DayId | null {
    const c = cards.find((c) => c.id === cardId);
    if (!c) return null;
    return cardToDayId(c);
  }

  function onDragStart(e: DragStartEvent) {
    const activeId = String(e.active.id);
    dragOrigin.current = findDayId(activeId);
    dragSnapshot.current = cards;
  }

  // 오늘 요일에 해당하는 dayId — column 자동 승급/강등 로직에 사용
  const todayDayId: DayId | null =
    todayWeekday >= 0 ? (`d${todayWeekday}` as DayId) : null;

  function computeColumnPatch(
    activeId: string,
    fromDayId: DayId,
    toDayId: DayId,
  ): "todo" | "doing" | "done" | null {
    const card = cards.find((c) => c.id === activeId);
    if (!card) return null;
    if (card.column === "done") return null;

    // 오늘 컬럼으로 들어옴 → 오늘 할 일 (doing) 로 자동 승급
    if (todayDayId && toDayId === todayDayId && card.column !== "doing") {
      return "doing";
    }
    // 오늘 컬럼에서 다른 요일로 → 이번 주 할 일 (todo) 로 강등
    if (
      todayDayId &&
      fromDayId === todayDayId &&
      toDayId !== todayDayId &&
      card.column === "doing"
    ) {
      return "todo";
    }
    return null;
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const from = findDayId(activeId);
    if (!from) return;

    const to: DayId =
      (DAY_IDS as readonly string[]).includes(overId)
        ? (overId as DayId)
        : findDayId(overId) ?? from;

    if (to === from) return;

    const newDueDay = dayIdToDueDay(to);
    const newColumn = computeColumnPatch(activeId, from, to);
    setCards((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, dueDay: newDueDay, ...(newColumn ? { column: newColumn } : {}) }
          : c,
      ),
    );
  }

  function onDragEnd(e: DragEndEvent) {
    const { active } = e;
    const origin = dragOrigin.current;
    const snapshot = dragSnapshot.current;
    dragOrigin.current = null;
    dragSnapshot.current = null;

    const activeId = String(active.id);
    const final = findDayId(activeId);
    if (!final) return;
    if (final === origin) return; // no change

    const newDueDay = dayIdToDueDay(final);
    const newColumn =
      origin !== null ? computeColumnPatch(activeId, origin, final) : null;

    startTransition(async () => {
      try {
        await updateCard(activeId, {
          dueDay: newDueDay,
          ...(newColumn ? { column: newColumn } : {}),
        });
      } catch {
        if (snapshot) setCards(snapshot);
        alert("요일 변경 실패");
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[840px] grid-cols-7 gap-2">
          {dayDates.map((d, i) => {
            const isToday = i === todayWeekday;
            const holiday = getHoliday(d);
            const dow = d.getUTCDay(); // 0=Sun
            const labelColor =
              holiday || dow === 0
                ? "text-red-600"
                : dow === 6
                ? "text-blue-600"
                : "text-neutral-700";
            const header = (
              <div>
                <div className="flex items-baseline justify-between gap-1">
                  <span className={"text-xs font-semibold " + labelColor}>
                    {DAY_LABELS_KO[i]}{" "}
                    <span className="text-neutral-400">
                      {d.getUTCMonth() + 1}/{d.getUTCDate()}
                    </span>
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-medium text-white">
                      오늘
                    </span>
                  )}
                </div>
                {holiday && (
                  <div className="mt-0.5 truncate text-[9px] text-red-500">
                    {holiday}
                  </div>
                )}
              </div>
            );
            return (
              <DayColumn
                key={`d${i}`}
                id={`d${i}` as DayId}
                header={header}
                isToday={isToday}
                cards={byDay[`d${i}` as DayId]}
                issues={issuesByDay[dateKey(d)]}
                onCardClick={onCardClick}
              />
            );
          })}
        </div>
      </div>

      {/* 미지정 풀 */}
      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold uppercase text-neutral-500">
          요일 미지정 ({byDay.unassigned.length})
        </div>
        <DayColumn
          id="unassigned"
          header={
            <div className="text-xs font-semibold text-neutral-600">
              요일을 정하지 않은 카드
            </div>
          }
          isToday={false}
          cards={byDay.unassigned}
          onCardClick={onCardClick}
        />
      </div>
    </DndContext>
  );
}
