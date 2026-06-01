"use client";

import { Card3D } from "./Card3D";
import type { CardData } from "../CardItem";

interface Props {
  card: CardData | null;
  onClick?: () => void;
}

export function TodayCard({ card, onClick }: Props) {
  if (!card) return null;
  return (
    <Card3D
      card={card}
      position={[0, 0, 2]}
      scale={1.4}
      onClick={onClick}
    />
  );
}
