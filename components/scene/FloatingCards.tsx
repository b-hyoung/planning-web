"use client";

import { Float } from "@react-three/drei";
import { useMemo } from "react";
import { Card3D } from "./Card3D";
import type { CardData } from "../CardItem";

interface Props {
  cards: CardData[];
  onCardClick: (card: CardData) => void;
}

function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  return Math.abs(h);
}

function placement(id: string, index: number): {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
} {
  const s = hashSeed(id);
  const angle = (index * 1.3 + (s % 17) / 17) * Math.PI;
  const radius = 5 + (s % 5);
  const x = Math.cos(angle) * radius;
  const y = ((s % 7) - 3) * 0.7;
  const z = -3 - ((s % 9) * 0.4);
  const ry = ((s % 21) - 10) * 0.04;
  return { position: [x, y, z], rotation: [0, ry, 0], scale: 0.5 + ((s % 10) / 40) };
}

export function FloatingCards({ cards, onCardClick }: Props) {
  const placed = useMemo(
    () => cards.map((c, i) => ({ card: c, ...placement(c.id, i) })),
    [cards]
  );

  return (
    <>
      {placed.map(({ card, position, rotation, scale }) => (
        <Float key={card.id} speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
          <Card3D
            card={card}
            position={position}
            rotation={rotation}
            scale={scale}
            onClick={() => onCardClick(card)}
          />
        </Float>
      ))}
    </>
  );
}
