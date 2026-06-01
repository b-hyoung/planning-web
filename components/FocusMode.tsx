"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import { updateCard } from "@/app/actions/cards";
import type { CardData } from "./CardItem";

interface Props {
  cards: CardData[];
  open: boolean;
  onClose: () => void;
}

/** 외곽에서 안쪽으로 수렴하는 입자 — 한 번만 */
function ConvergingParticles() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 500;

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 16 + Math.random() * 6;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const obj = { s: 1 };
    gsap.fromTo(
      obj,
      { s: 1 },
      {
        s: 0.25,
        duration: 3.2,
        ease: "power2.inOut",
        onUpdate: () => {
          if (ref.current) ref.current.scale.setScalar(obj.s);
        },
      },
    );
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        color="#9bb5d8"
        transparent
        opacity={0.85}
      />
    </points>
  );
}

interface CardLayoutPos {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

/** N개의 카드를 곡선(arc) 또는 그리드로 배치 */
function computeLayout(total: number): CardLayoutPos[] {
  const out: CardLayoutPos[] = [];
  if (total === 1) {
    out.push({ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1.3 });
    return out;
  }
  if (total <= 4) {
    // 1줄 호(arc) — 가운데 크게, 양옆 살짝 비스듬
    const radius = 7;
    const span = Math.PI * 0.55;
    for (let i = 0; i < total; i++) {
      const t = total === 1 ? 0.5 : i / (total - 1);
      const angle = -span / 2 + t * span;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius + radius;
      const ry = -angle * 0.6;
      out.push({ position: [x, 0, z], rotation: [0, ry, 0], scale: 1.0 });
    }
    return out;
  }
  // 5+ : 2줄 그리드
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  const gapX = 4.2;
  const gapY = 3.4;
  for (let i = 0; i < total; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = (col - (cols - 1) / 2) * gapX;
    const y = ((rows - 1) / 2 - row) * gapY;
    out.push({ position: [x, y, 0], rotation: [0, 0, 0], scale: 0.85 });
  }
  return out;
}

interface FocusCardProps {
  card: CardData;
  layout: CardLayoutPos;
  onComplete: (id: string) => void;
  entranceDelay: number;
}

function FocusCard({ card, layout, onComplete, entranceDelay }: FocusCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const completing = useRef(false);

  // 등장 애니메이션
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.scale.setScalar(0);
    groupRef.current.position.z = layout.position[2] - 4;
    gsap.to(groupRef.current.scale, {
      x: layout.scale,
      y: layout.scale,
      z: layout.scale,
      duration: 1.1,
      delay: entranceDelay,
      ease: "elastic.out(1, 0.6)",
    });
    gsap.to(groupRef.current.position, {
      z: layout.position[2],
      duration: 1,
      delay: entranceDelay,
      ease: "power2.out",
    });
  }, [layout.scale, layout.position, entranceDelay]);

  // 호버 시 살짝 들어올림
  useFrame(() => {
    if (!meshRef.current || completing.current) return;
    const targetLift = hovered ? 0.6 : 0;
    meshRef.current.position.z += (targetLift - meshRef.current.position.z) * 0.18;
  });

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    if (completing.current || !groupRef.current) return;
    completing.current = true;
    // 위로 솟구쳐 사라짐
    gsap.to(groupRef.current.position, {
      y: groupRef.current.position.y + 7,
      duration: 0.75,
      ease: "power2.in",
    });
    gsap.to(groupRef.current.rotation, {
      x: Math.PI * 0.5,
      duration: 0.75,
      ease: "power2.in",
    });
    gsap.to(groupRef.current.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.5,
      delay: 0.25,
      ease: "power2.in",
      onComplete: () => onComplete(card.id),
    });
  }

  const tagColor = card.tag === "personal" ? "#7cb342" : "#4a90e2";

  return (
    <group
      ref={groupRef}
      position={layout.position}
      rotation={layout.rotation}
    >
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
        onClick={handleClick}
      >
        <boxGeometry args={[3.4, 2.3, 0.18]} />
        <meshStandardMaterial
          color={tagColor}
          emissive={tagColor}
          emissiveIntensity={hovered ? 0.55 : 0.3}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>
      <Html
        center
        transform
        distanceFactor={4}
        position={[0, 0, 0.11]}
        style={{
          width: "320px",
          height: "200px",
          background: "rgba(255,255,255,0.97)",
          borderLeft: `10px solid ${tagColor}`,
          borderRadius: "14px",
          padding: "20px 22px",
          fontFamily: "system-ui",
          pointerEvents: "none",
          userSelect: "none",
          boxShadow: hovered
            ? `0 30px 60px rgba(0,0,0,0.7), 0 0 60px ${tagColor}99`
            : `0 20px 40px rgba(0,0,0,0.6), 0 0 30px ${tagColor}55`,
          transition: "box-shadow 200ms",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: "#a3a3a3",
            letterSpacing: 4,
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          오늘 할 일
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#0a0a0a",
            lineHeight: 1.2,
            marginBottom: 12,
          }}
        >
          {card.title}
        </div>
        {card.memo && (
          <p
            style={{
              fontSize: 12,
              color: "#525252",
              lineHeight: 1.5,
              margin: 0,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical" as const,
            }}
          >
            {card.memo}
          </p>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            right: 18,
            fontSize: 10,
            color: hovered ? "#10b981" : "#a3a3a3",
            fontWeight: 700,
            letterSpacing: 2,
            transition: "color 200ms",
          }}
        >
          {hovered ? "클릭 = 완료" : ""}
        </div>
      </Html>
    </group>
  );
}

/** 그룹 전체를 마우스에 따라 살짝 움직여 패럴랙스 효과 */
function MouseParallax({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const { gl } = useThree();

  useEffect(() => {
    const dom = gl.domElement;
    function onMove(e: PointerEvent) {
      const rect = dom.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    function onLeave() {
      mouse.current.x = 0;
      mouse.current.y = 0;
    }
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerleave", onLeave);
    return () => {
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerleave", onLeave);
    };
  }, [gl]);

  useFrame(() => {
    if (!groupRef.current) return;
    // 위치: 반대 방향으로 살짝 이동
    const tx = -mouse.current.x * 1.2;
    const ty = -mouse.current.y * 0.8;
    groupRef.current.position.x += (tx - groupRef.current.position.x) * 0.06;
    groupRef.current.position.y += (ty - groupRef.current.position.y) * 0.06;
    // 회전: 마우스 향해 살짝 기울임
    const ry = mouse.current.x * 0.18;
    const rx = -mouse.current.y * 0.12;
    groupRef.current.rotation.y += (ry - groupRef.current.rotation.y) * 0.06;
    groupRef.current.rotation.x += (rx - groupRef.current.rotation.x) * 0.06;
  });

  return <group ref={groupRef}>{children}</group>;
}

function CelebrationOverlay({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current.children,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "elastic.out(1, 0.6)",
      },
    );
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center"
    >
      <div className="text-7xl">🎉</div>
      <div className="mt-6 text-3xl font-bold text-white">오늘 할 일 다 끝!</div>
      <div className="mt-3 text-sm text-neutral-400">수고하셨습니다</div>
      <button
        onClick={onClose}
        className="mt-8 rounded-lg bg-white/10 px-6 py-2.5 text-sm font-medium text-white backdrop-blur hover:bg-white/20"
      >
        닫기
      </button>
    </div>
  );
}

export function FocusMode({ cards, open, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) setCompleted(new Set());
  }, [open]);

  // 풀스크린 + ESC
  useEffect(() => {
    if (!open) return;
    const el = containerRef.current;
    el?.requestFullscreen?.().catch(() => {});

    function onFsChange() {
      if (!document.fullscreenElement) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("keydown", onKey);

    if (overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out" },
      );
    }

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("keydown", onKey);
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, [open, onClose]);

  const visible = useMemo(
    () => cards.filter((c) => !completed.has(c.id)),
    [cards, completed],
  );
  const layouts = useMemo(() => computeLayout(visible.length), [visible.length]);
  const allDone = open && cards.length > 0 && visible.length === 0;

  function handleCardComplete(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    startTransition(async () => {
      try {
        await updateCard(id, { column: "done" });
      } catch {
        setCompleted((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        alert("완료 저장 실패");
      }
    });
  }

  if (!open) return null;

  if (cards.length === 0) {
    return (
      <div ref={containerRef} className="fixed inset-0 z-[100] bg-black">
        <div className="flex h-full flex-col items-center justify-center text-white">
          <div className="text-2xl">오늘 할 일이 없어요</div>
          <button
            onClick={onClose}
            className="mt-6 rounded-lg bg-white/10 px-5 py-2 text-sm hover:bg-white/20"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black">
      <div ref={overlayRef} className="absolute inset-0 opacity-0">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 55 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={["#020410"]} />
          <fog attach="fog" args={["#020410", 12, 38]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 0, 8]} intensity={2.5} color="#ffffff" />
          <pointLight position={[-12, 6, 4]} intensity={1.4} color="#4a90e2" />
          <pointLight position={[12, -6, 4]} intensity={1.4} color="#7cb342" />

          <MouseParallax>
            {visible.map((card, i) => (
              <FocusCard
                key={card.id}
                card={card}
                layout={layouts[i] ?? {
                  position: [0, 0, 0],
                  rotation: [0, 0, 0],
                  scale: 1,
                }}
                onComplete={handleCardComplete}
                entranceDelay={0.2 + i * 0.12}
              />
            ))}
            <ConvergingParticles />
          </MouseParallax>
        </Canvas>
      </div>

      {/* 상단 진행 바 */}
      <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2">
        <div className="flex items-center gap-1.5">
          {cards.map((c) => {
            const isDone = completed.has(c.id);
            return (
              <span
                key={c.id}
                className={
                  "h-1.5 w-8 rounded-full transition-all duration-500 " +
                  (isDone ? "bg-emerald-500" : "bg-white/25")
                }
              />
            );
          })}
        </div>
        <div className="mt-2 text-center text-[10px] uppercase tracking-widest text-neutral-400">
          {completed.size} / {cards.length} 완료
        </div>
      </div>

      {allDone && <CelebrationOverlay onClose={onClose} />}

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-widest text-neutral-500">
        카드 클릭 = 완료 · ESC 로 나가기
      </div>

      <button
        onClick={onClose}
        className="absolute right-6 top-6 z-20 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur hover:bg-white/20"
        aria-label="포커스 모드 종료"
      >
        ✕
      </button>
    </div>
  );
}
