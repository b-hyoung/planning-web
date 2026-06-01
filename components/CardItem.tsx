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
  linkedIssue?: { id: string; title: string; status: string } | null;
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

  // 드래그 중 카드는 살짝 기울고 커지며 따라옴 (관성감)
  // 다른 카드들은 부드러운 스프링으로 자리 양보
  const liftedTransform = transform
    ? `${CSS.Transform.toString(transform)} ${isDragging ? "rotate(-2deg) scale(1.04)" : ""}`
    : undefined;

  const style: React.CSSProperties = {
    transform: liftedTransform,
    // 드래그 중: transition 없음 → 즉시 마우스 따라옴
    // 양보 카드: dnd-kit 의 자체 transition 사용 (overshoot 없는 부드러운 ease-out)
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 30 : "auto",
    boxShadow: isDragging
      ? "0 12px 28px rgba(15, 23, 42, 0.18), 0 4px 10px rgba(15, 23, 42, 0.12)"
      : undefined,
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
        "mb-2 cursor-grab active:cursor-grabbing rounded-lg border border-neutral-200 border-l-4 " +
        tagStyle.border +
        " bg-white p-3 shadow-sm hover:shadow will-change-transform"
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
