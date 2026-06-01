"use client";

import { useMemo, useState, useTransition, useEffect, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
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
  unresolvedIssues: { id: string; title: string }[];
}

type ColumnId = "todo" | "doing" | "done";
const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "todo", title: "이번 주 할 일" },
  { id: "doing", title: "오늘 할 일" },
  { id: "done", title: "완료" },
];
const COL_IDS: readonly ColumnId[] = ["todo", "doing", "done"];

/**
 * 드래그 중인 카드가 어느 컬럼에 60% 이상 겹치면 그 컬럼을 우선 타깃으로.
 * 60% 미만이면 기본 rectIntersection (카드 단위 정밀 타깃).
 */
const collisionWith60Threshold: CollisionDetection = (args) => {
  const { collisionRect, droppableContainers } = args;

  if (collisionRect) {
    const dragArea =
      (collisionRect.right - collisionRect.left) *
      (collisionRect.bottom - collisionRect.top);

    if (dragArea > 0) {
      const colHits = droppableContainers
        .filter((d) => COL_IDS.includes(d.id as ColumnId))
        .map((d) => {
          const r = d.rect.current;
          if (!r) return { id: d.id, ratio: 0 };
          const xOverlap = Math.max(
            0,
            Math.min(collisionRect.right, r.right) -
              Math.max(collisionRect.left, r.left),
          );
          const yOverlap = Math.max(
            0,
            Math.min(collisionRect.bottom, r.bottom) -
              Math.max(collisionRect.top, r.top),
          );
          return { id: d.id, ratio: (xOverlap * yOverlap) / dragArea };
        });

      const above = colHits.filter((c) => c.ratio >= 0.6);
      if (above.length > 0) {
        above.sort((a, b) => b.ratio - a.ratio);
        return [{ id: above[0].id }];
      }
    }
  }

  return rectIntersection(args);
};

export function BoardClient({ weekStartIso, initialCards, unresolvedIssues }: Props) {
  const [cards, setCards] = useState<CardData[]>(initialCards);
  const [filter, setFilter] = useState<TagFilterValue>("all");
  const [editing, setEditing] = useState<CardData | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Re-sync local state when server data refreshes (after revalidatePath)
  const prevInitial = useRef(initialCards);
  useEffect(() => {
    if (prevInitial.current !== initialCards) {
      prevInitial.current = initialCards;
      setCards(initialCards);
    }
  }, [initialCards]);

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
      // Reorder within column (operate on visible/filtered list for correct UI)
      const colCards = byColumn[fromCol];
      const oldIndex = colCards.findIndex((c) => c.id === activeId);
      const newIndex = colCards.findIndex((c) => c.id === overId);
      if (oldIndex < 0 || newIndex < 0) return;
      const newOrder = arrayMove(colCards, oldIndex, newIndex);

      // Build a quick lookup of the new positions in this column
      const newPos = new Map(newOrder.map((c, i) => [c.id, i]));
      next = cards.map((c) => c);
      next.sort((a, b) => {
        if (a.column !== fromCol || b.column !== fromCol) return 0;
        return (newPos.get(a.id) ?? 0) - (newPos.get(b.id) ?? 0);
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
      <DndContext
        sensors={sensors}
        collisionDetection={collisionWith60Threshold}
        onDragEnd={onDragEnd}
      >
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
      <CardModal
        card={editing}
        onClose={() => setEditing(null)}
        unresolvedIssues={unresolvedIssues}
      />
    </>
  );
}
