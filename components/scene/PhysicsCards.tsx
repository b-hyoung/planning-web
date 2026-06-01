"use client";

import { useMemo } from "react";
import { PhysicsCard } from "./PhysicsCard";
import { PhysicsBoundary } from "./PhysicsBoundary";
import type { CardData } from "../CardItem";

interface Props {
  todayCard: CardData | null;
  otherCards: CardData[];
  onCardClick: (card: CardData) => void;
}

function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  return Math.abs(h);
}

function randomPosition(id: string, index: number): [number, number, number] {
  const s = hashSeed(id);
  const angle = ((index * 1.7 + (s % 13) / 13) * Math.PI) % (Math.PI * 2);
  const radius = 4 + (s % 5);
  const x = Math.cos(angle) * radius;
  const y = ((s % 7) - 3) * 1.2;
  const z = -1 - ((s % 5) * 0.6);
  return [x, y, z];
}

function gentleVelocity(id: string): [number, number, number] {
  const s = hashSeed(id);
  const r = (n: number) => ((s >> n) % 100) / 200 - 0.25;
  return [r(0), r(3), r(6)];
}

export function PhysicsCards({ todayCard, otherCards, onCardClick }: Props) {
  const layout = useMemo(() => {
    const others = otherCards.map((c, i) => ({
      card: c,
      position: randomPosition(c.id, i),
      velocity: gentleVelocity(c.id),
    }));
    return others;
  }, [otherCards]);

  return (
    <>
      <PhysicsBoundary />
      {todayCard && (
        <PhysicsCard
          key={todayCard.id}
          card={todayCard}
          initialPosition={[0, 0, 1]}
          big
          onClick={() => onCardClick(todayCard)}
        />
      )}
      {layout.map(({ card, position, velocity }) => (
        <PhysicsCard
          key={card.id}
          card={card}
          initialPosition={position}
          initialVelocity={velocity}
          onClick={() => onCardClick(card)}
        />
      ))}
    </>
  );
}
