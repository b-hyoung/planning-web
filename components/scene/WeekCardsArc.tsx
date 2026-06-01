"use client";

import { Card3D } from "./Card3D";
import type { CardData } from "../CardItem";

interface Props {
  cards: CardData[];
  onCardClick: (card: CardData) => void;
}

export function WeekCardsArc({ cards, onCardClick }: Props) {
  const radius = 9;
  const arcSpan = Math.PI * 1.1;
  const cols = ["todo", "doing", "done"] as const;

  return (
    <>
      {cards.map((c) => {
        const colIndex = cols.indexOf(c.column as (typeof cols)[number]);
        const y = colIndex >= 0 ? (1 - colIndex) * 2.2 : 0;
        const sameColCards = cards.filter((x) => x.column === c.column);
        const localIndex = sameColCards.findIndex((x) => x.id === c.id);
        const t = sameColCards.length > 1 ? localIndex / (sameColCards.length - 1) : 0.5;
        const angle = -arcSpan / 2 + t * arcSpan;
        const x = Math.sin(angle) * radius;
        const z = -Math.cos(angle) * radius + 4;
        const ry = -angle;
        return (
          <Card3D
            key={c.id}
            card={c}
            position={[x, y, z]}
            rotation={[0, ry, 0]}
            scale={0.7}
            onClick={() => onCardClick(c)}
          />
        );
      })}
    </>
  );
}
