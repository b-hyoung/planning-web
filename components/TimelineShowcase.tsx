"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";

export interface ShowcaseCard {
  id: string;
  title: string;
  memo: string | null;
  tag: string;
  completedAtIso: string;
}

interface Props {
  cards: ShowcaseCard[];
}

const POSTIT_COLORS = [
  "#fef3c7", "#fde68a", "#fce7f3", "#dbeafe",
  "#bbf7d0", "#e0e7ff", "#fed7aa", "#fef9c3",
];

function pickColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  return POSTIT_COLORS[Math.abs(h) % POSTIT_COLORS.length];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${day}`;
}

interface LayoutPos {
  position: [number, number, number];
  rotation: [number, number, number];
  delay: number;
  color: string;
}

function computeWallLayout(cards: ShowcaseCard[]): LayoutPos[] {
  const cols = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(cards.length * 1.4))));
  const cardW = 2.6;
  const cardH = 1.9;
  const gapX = 0.5;
  const gapY = 0.6;
  const stepX = cardW + gapX;
  const stepY = cardH + gapY;

  return cards.map((c, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = (col - (cols - 1) / 2) * stepX;
    const y = -(row * stepY) + ((Math.ceil(cards.length / cols) - 1) * stepY) / 2;
    // 곡선 벽 — 가장자리가 살짝 뒤로
    const curve = Math.pow(Math.abs(col - (cols - 1) / 2), 1.4) * 0.35;
    const z = -curve;
    const ry = (col - (cols - 1) / 2) * -0.05;
    const rz = ((Math.abs(((i * 37) % 7) - 3)) - 0) * 0.012; // 살짝 기울기
    // 등장 딜레이 — 가운데에서 바깥으로
    const distFromCenter = Math.hypot(col - (cols - 1) / 2, row);
    const delay = 0.3 + distFromCenter * 0.05;

    return {
      position: [x, y, z],
      rotation: [0, ry, rz],
      delay,
      color: pickColor(c.id),
    };
  });
}

interface CardProps {
  card: ShowcaseCard;
  layout: LayoutPos;
}

function ShowcaseCardMesh({ card, layout }: CardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    g.position.set(
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5,
      0,
    );
    g.scale.setScalar(0);
    g.rotation.set(
      (Math.random() - 0.5) * Math.PI * 2,
      (Math.random() - 0.5) * Math.PI * 2,
      (Math.random() - 0.5) * Math.PI * 2,
    );

    const tl = gsap.timeline();
    tl.to(
      g.position,
      {
        x: layout.position[0],
        y: layout.position[1],
        z: layout.position[2],
        duration: 1.4,
        delay: layout.delay,
        ease: "expo.out",
      },
      0,
    );
    tl.to(
      g.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.0,
        delay: layout.delay,
        ease: "elastic.out(1, 0.55)",
      },
      0,
    );
    tl.to(
      g.rotation,
      {
        x: layout.rotation[0],
        y: layout.rotation[1],
        z: layout.rotation[2],
        duration: 1.6,
        delay: layout.delay,
        ease: "power3.out",
      },
      0,
    );
  }, [layout.position, layout.rotation, layout.delay]);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetLift = hovered ? 1.2 : 0;
    const currentZ = groupRef.current.position.z;
    const baseZ = layout.position[2];
    const newZ = currentZ + (baseZ + targetLift - currentZ) * 0.18;
    groupRef.current.position.z = newZ;
  });

  function handlePointerOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  }
  function handlePointerOut() {
    setHovered(false);
    document.body.style.cursor = "";
  }

  return (
    <group ref={groupRef}>
      <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.18}>
        <mesh
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <planeGeometry args={[2.6, 1.9]} />
          <meshStandardMaterial
            color={layout.color}
            emissive={layout.color}
            emissiveIntensity={hovered ? 0.5 : 0.18}
            metalness={0.05}
            roughness={0.8}
          />
        </mesh>
        <Html
          center
          transform
          distanceFactor={3.2}
          position={[0, 0, 0.02]}
          style={{
            width: "260px",
            height: "190px",
            background: layout.color,
            borderRadius: "4px",
            padding: "18px 20px",
            fontFamily:
              "'Caveat', 'Nanum Pen Script', 'Comic Sans MS', system-ui, sans-serif",
            pointerEvents: "none",
            userSelect: "none",
            color: "#1a1a1a",
            boxShadow: hovered
              ? "0 16px 40px rgba(0,0,0,0.4), inset 0 -10px 14px rgba(0,0,0,0.06)"
              : "0 8px 18px rgba(0,0,0,0.25), inset 0 -8px 12px rgba(0,0,0,0.05)",
            transition: "box-shadow 200ms",
          }}
        >
          {/* 핀 */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 6,
              width: 10,
              height: 10,
              background: "#ef4444",
              borderRadius: "50%",
              transform: "translateX(-50%)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.35)",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              opacity: 0.65,
              marginTop: 6,
              marginBottom: 6,
            }}
          >
            <span>{formatDate(card.completedAtIso)}</span>
            <span style={{ background: "rgba(255,255,255,0.5)", padding: "1px 6px", borderRadius: 999 }}>
              {card.tag === "personal" ? "개인" : "업무"}
            </span>
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 8,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
            }}
          >
            {card.title}
          </div>
          {card.memo && (
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.35,
                margin: 0,
                opacity: 0.85,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical" as const,
              }}
            >
              {card.memo}
            </p>
          )}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 12,
              fontSize: 20,
              color: "#059669",
              opacity: 0.7,
            }}
          >
            ✓
          </div>
        </Html>
      </Float>
    </group>
  );
}

function BurstParticles() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 800;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = 0;
      arr[i * 3 + 1] = 0;
      arr[i * 3 + 2] = 0;
    }
    return arr;
  }, []);
  const velocities = useMemo(() => {
    const arr: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 8 + Math.random() * 20;
      arr.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed * 0.6,
      });
    }
    return arr;
  }, []);
  const startTime = useRef<number | null>(null);

  useFrame((state) => {
    if (!ref.current) return;
    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - startTime.current;
    if (t > 2.5) {
      ref.current.visible = false;
      return;
    }
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      const v = velocities[i];
      const damp = Math.exp(-t * 1.5);
      attr.setX(i, v.x * t * damp);
      attr.setY(i, v.y * t * damp);
      attr.setZ(i, v.z * t * damp);
    }
    attr.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, 1 - t / 2.5);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        sizeAttenuation
        color="#fde68a"
        transparent
        opacity={1}
      />
    </points>
  );
}

function StarField() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 400;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 25 + Math.random() * 12;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.015;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} sizeAttenuation color="#b6c7e0" transparent opacity={0.7} />
    </points>
  );
}

function CameraIntro() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 4);
    gsap.to(camera.position, {
      z: 11,
      duration: 2.5,
      delay: 0.2,
      ease: "expo.out",
    });
  }, [camera]);
  return null;
}

export function TimelineShowcase({ cards }: Props) {
  const layouts = useMemo(() => computeWallLayout(cards), [cards]);
  const total = cards.length;
  const weekCount = useMemo(() => {
    const weeks = new Set<string>();
    for (const c of cards) {
      const d = new Date(c.completedAtIso);
      // ISO week ish — yyyy-Wmm based on month/week
      const ws = `${d.getFullYear()}-${Math.floor(d.getDate() / 7)}-${d.getMonth()}`;
      weeks.add(ws);
    }
    return weeks.size;
  }, [cards]);

  return (
    <div className="relative h-[calc(100vh-9rem)] w-full overflow-hidden rounded-2xl">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, #1a2150 0%, #0a0f25 50%, #020410 100%)",
        }}
      />
      <Canvas
        camera={{ position: [0, 0, 4], fov: 55 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#020410"]} />
        <fog attach="fog" args={["#020410", 16, 38]} />
        <ambientLight intensity={0.7} />
        <pointLight position={[0, 0, 6]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[6, 8, 4]} intensity={0.8} color="#fff7d4" />
        <CameraIntro />
        <StarField />
        <BurstParticles />
        {cards.map((card, i) => (
          <ShowcaseCardMesh
            key={card.id}
            card={card}
            layout={layouts[i]}
          />
        ))}
      </Canvas>

      {/* 상단 헤더 */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between p-6">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[6px] text-amber-300/70">
            $ completed_work --view=showcase
          </div>
          <div className="mt-2 text-3xl font-bold text-neutral-50 md:text-4xl">
            {total}개의 완료
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            {weekCount}주에 걸쳐 마무리한 일들
          </div>
        </div>
      </div>

      {/* 하단 힌트 */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-widest text-neutral-500">
        호버하면 카드가 떠오릅니다
      </div>
    </div>
  );
}
