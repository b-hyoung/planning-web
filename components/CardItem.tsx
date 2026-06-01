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
