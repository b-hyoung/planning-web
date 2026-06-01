"use client";

import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { CardData } from "../CardItem";

interface Props {
  card: CardData;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  onClick?: () => void;
}

const TAG_COLOR: Record<string, string> = {
  work: "#4a90e2",
  personal: "#7cb342",
};

export function Card3D({ card, position, rotation = [0, 0, 0], scale = 1, onClick }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;
    const targetZ = hovered ? 0.5 : 0;
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.1;
  });

  const cardColor = TAG_COLOR[card.tag] ?? "#888";

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color={cardColor} metalness={0.1} roughness={0.6} />
      </mesh>
      <Html
        position={[0, 0, 0.01]}
        center
        distanceFactor={6}
        style={{
          width: "260px",
          height: "180px",
          background: "white",
          borderLeft: `6px solid ${cardColor}`,
          borderRadius: "10px",
          padding: "14px 16px",
          boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
          fontFamily: "system-ui",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>{card.title}</div>
        {card.memo && (
          <p style={{ marginTop: 6, fontSize: 11, color: "#666", lineHeight: 1.4 }}>
            {card.memo.length > 90 ? card.memo.slice(0, 90) + "…" : card.memo}
          </p>
        )}
      </Html>
    </group>
  );
}
