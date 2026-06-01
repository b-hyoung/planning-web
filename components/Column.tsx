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
