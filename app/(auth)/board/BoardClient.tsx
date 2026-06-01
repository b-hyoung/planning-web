"use client";

import { useMemo, useState, useTransition, useEffect, useRef } from "react";
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
