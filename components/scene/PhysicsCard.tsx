"use client";

import { Html } from "@react-three/drei";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { CardData } from "../CardItem";
import { usePhysicsInteraction } from "./PhysicsInteraction";

interface Props {
  card: CardData;
  initialPosition: [number, number, number];
  initialVelocity?: [number, number, number];
  big?: boolean;
  onClick: () => void;
}

const TAG_COLOR: Record<string, string> = {
  work: "#4a90e2",
  personal: "#7cb342",
};

const CLICK_TIME_MS = 220;
const CLICK_DIST_PX = 6;

export function PhysicsCard({
  card,
  initialPosition,
  initialVelocity = [0, 0, 0],
  big = false,
  onClick,
}: Props) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const dragging = useRef(false);
  const pointerStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const dragTargetZ = useRef(initialPosition[2]);
  const { camera, gl } = useThree();
  const [hovered, setHovered] = useState(false);
  const interaction = usePhysicsInteraction();

  const planeW = big ? 4.2 : 3;
  const planeH = big ? 2.8 : 2;
  const cardColor = TAG_COLOR[card.tag] ?? "#888";

  // 화면 좌표 → 월드 좌표 (드래그 카드의 z 평면 기준 투영)
  function projectPointerToCardPlane(clientX: number, clientY: number) {
    const rect = gl.domElement.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
    const v = new THREE.Vector3(ndcX, ndcY, 0.5);
    v.unproject(camera);
    const dir = v.sub(camera.position).normalize();
    const distance = (dragTargetZ.current - camera.position.z) / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(distance));
  }

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    pointerStart.current = {
      x: e.nativeEvent.clientX,
      y: e.nativeEvent.clientY,
      t: performance.now(),
    };
    dragging.current = true;
    if (bodyRef.current) {
      const t = bodyRef.current.translation();
      dragTargetZ.current = t.z;
      bodyRef.current.setBodyType(1, true); // 1 = kinematicPosition
      bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
    (e.target as Element).setPointerCapture?.(e.nativeEvent.pointerId);
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (!dragging.current || !bodyRef.current) return;
    const pos = projectPointerToCardPlane(e.nativeEvent.clientX, e.nativeEvent.clientY);
    bodyRef.current.setNextKinematicTranslation({ x: pos.x, y: pos.y, z: pos.z });
  }

  function handlePointerUp(e: ThreeEvent<PointerEvent>) {
    if (!dragging.current) return;
    dragging.current = false;

    const start = pointerStart.current;
    const dx = start ? e.nativeEvent.clientX - start.x : 0;
    const dy = start ? e.nativeEvent.clientY - start.y : 0;
    const dt = start ? performance.now() - start.t : Infinity;
    const moved = Math.hypot(dx, dy);
    pointerStart.current = null;

    if (bodyRef.current) {
      bodyRef.current.setBodyType(0, true); // 0 = dynamic
    }

    // 짧고 거의 안 움직였으면 클릭
    if (moved < CLICK_DIST_PX && dt < CLICK_TIME_MS) {
      onClick();
    }
  }

  useFrame(() => {
    if (!bodyRef.current || dragging.current) return;

    // 호버 시 살짝 회전 가속
    if (hovered) {
      bodyRef.current.applyTorqueImpulse({ x: 0, y: 0.0005, z: 0 }, true);
    }

    const t = bodyRef.current.translation();

    // 마우스 자석 (attract / repel)
    const mode = interaction.attractorMode.current;
    if (mode !== "off" && interaction.cursorActive.current) {
      const cx = interaction.cursor.current.x;
      const cy = interaction.cursor.current.y;
      const dx = cx - t.x;
      const dy = cy - t.y;
      const distSq = dx * dx + dy * dy;
      const RADIUS_SQ = 36; // 6 단위 반경 이내만
      if (distSq < RADIUS_SQ && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const falloff = 1 - distSq / RADIUS_SQ;
        const strength = (mode === "attract" ? 1 : -1) * 0.06 * falloff;
        bodyRef.current.applyImpulse(
          { x: (dx / dist) * strength, y: (dy / dist) * strength, z: 0 },
          true,
        );
      }
    }

    // 스크롤 바람
    const w = interaction.wind.current;
    if (w.lengthSq() > 0.001) {
      bodyRef.current.applyImpulse(
        { x: w.x * 0.02, y: w.y * 0.02, z: 0 },
        true,
      );
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={initialPosition}
      linearVelocity={initialVelocity}
      angularVelocity={[0, (Math.random() - 0.5) * 0.4, 0]}
      colliders="cuboid"
      mass={big ? 2 : 1}
      linearDamping={0.6}
      angularDamping={0.8}
      restitution={0.4}
      friction={0.2}
    >
      <mesh
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      >
        <boxGeometry args={[planeW, planeH, 0.15]} />
        <meshStandardMaterial color={cardColor} metalness={0.15} roughness={0.55} />
      </mesh>
      <Html
        position={[0, 0, 0.09]}
        center
        transform
        distanceFactor={5}
        style={{
          width: big ? "360px" : "300px",
          height: big ? "220px" : "180px",
          background: "white",
          borderLeft: `8px solid ${cardColor}`,
          borderRadius: "14px",
          padding: "20px 22px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: big ? 24 : 20,
            color: "#0a0a0a",
            lineHeight: 1.25,
          }}
        >
          {card.title}
        </div>
        {card.memo && (
          <p
            style={{
              marginTop: 10,
              fontSize: 13,
              color: "#525252",
              lineHeight: 1.5,
            }}
          >
            {card.memo.length > 90 ? card.memo.slice(0, 90) + "…" : card.memo}
          </p>
        )}
      </Html>
    </RigidBody>
  );
}
