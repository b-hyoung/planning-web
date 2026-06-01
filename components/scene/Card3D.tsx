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
        position={[0, 0, 0.02]}
        center
        distanceFactor={3.5}
        style={{
          width: "320px",
          height: "200px",
          background: "white",
          borderLeft: `8px solid ${cardColor}`,
          borderRadius: "14px",
          padding: "20px 22px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 22, color: "#0a0a0a", lineHeight: 1.25 }}>
          {card.title}
        </div>
        {card.memo && (
          <p style={{ marginTop: 10, fontSize: 14, color: "#525252", lineHeight: 1.5 }}>
            {card.memo.length > 90 ? card.memo.slice(0, 90) + "…" : card.memo}
          </p>
        )}
      </Html>
    </group>
  );
}
