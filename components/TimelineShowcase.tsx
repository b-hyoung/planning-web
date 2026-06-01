"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

interface LayoutPos {
  position: [number, number, number];
  rotation: [number, number, number];
  delay: number;
  color: string;
}

function computeWallLayout(cards: ShowcaseCard[]): {
  layouts: LayoutPos[];
  cols: number;
  rows: number;
} {
  const total = cards.length;
  const cols = Math.min(5, Math.max(3, Math.ceil(Math.sqrt(total * 0.9))));
  const rows = Math.max(1, Math.ceil(total / cols));
  const cardW = 3.4;
  const cardH = 2.5;
  const gapX = 0.4;
  const gapY = 0.5;
  const stepX = cardW + gapX;
  const stepY = cardH + gapY;

  const layouts = cards.map((c, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = (col - (cols - 1) / 2) * stepX;
    const y = -(row * stepY) + ((rows - 1) * stepY) / 2;
    const z = 0;
    const rz = ((Math.abs(((i * 37) % 7) - 3))) * 0.018;
    const distFromCenter = Math.hypot(col - (cols - 1) / 2, row);
    // scrub 시 카드별 reveal 타이밍 (0~1)
    const revealStart = Math.min(0.6, distFromCenter * 0.06);

    return {
      position: [x, y, z] as [number, number, number],
      rotation: [0, 0, rz] as [number, number, number],
      delay: revealStart,
      color: pickColor(c.id),
    };
  });

  return { layouts, cols, rows };
}

interface CardProps {
  card: ShowcaseCard;
  layout: LayoutPos;
  scrollContainer: React.RefObject<HTMLDivElement | null>;
}

function ShowcaseCardMesh({ card, layout, scrollContainer }: CardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!groupRef.current || !scrollContainer.current) return;
    const g = groupRef.current;

    // 시작 상태: 가운데에 모이고 보이지 않음
    g.position.set(
      (Math.random() - 0.5) * 0.4,
      (Math.random() - 0.5) * 0.4,
      0,
    );
    g.scale.setScalar(0);
    g.rotation.set(
      (Math.random() - 0.5) * Math.PI,
      (Math.random() - 0.5) * Math.PI,
      (Math.random() - 0.5) * Math.PI,
    );

    // 스크롤 진행 0~1 중 카드별 구간 (revealStart ~ revealStart+0.35)
    const start = 0.05 + layout.delay * 0.55;
    const end = Math.min(0.98, start + 0.35);

    const tween = gsap.timeline({
      scrollTrigger: {
        trigger: scrollContainer.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
      },
    });

    tween
      .to(
        g.position,
        {
          x: layout.position[0],
          y: layout.position[1],
          z: layout.position[2],
          ease: "expo.out",
        },
        start,
      )
      .to(
        g.scale,
        { x: 1, y: 1, z: 1, ease: "back.out(1.6)" },
        start,
      )
      .to(
        g.rotation,
        {
          x: layout.rotation[0],
          y: layout.rotation[1],
          z: layout.rotation[2],
          ease: "power3.out",
        },
        start,
      );

    void end;

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [layout.position, layout.rotation, layout.delay, scrollContainer]);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetLift = hovered ? 1.0 : 0;
    const currentZ = groupRef.current.position.z;
    const baseZ = layout.position[2];
    groupRef.current.position.z = currentZ + (baseZ + targetLift - currentZ) * 0.18;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.0} rotationIntensity={0.07} floatIntensity={0.12}>
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "";
          }}
        >
          <planeGeometry args={[3.4, 2.5]} />
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
          distanceFactor={2.4}
          position={[0, 0, 0.02]}
          style={{
            width: "340px",
            height: "250px",
            background: layout.color,
            borderRadius: "4px",
            padding: "22px 24px",
            fontFamily:
              "'Caveat', 'Nanum Pen Script', 'Comic Sans MS', system-ui, sans-serif",
            pointerEvents: "none",
            userSelect: "none",
            color: "#1a1a1a",
            boxShadow: hovered
              ? "0 18px 44px rgba(0,0,0,0.45), inset 0 -10px 14px rgba(0,0,0,0.06)"
              : "0 10px 20px rgba(0,0,0,0.28), inset 0 -8px 12px rgba(0,0,0,0.05)",
            transition: "box-shadow 200ms",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 8,
              width: 12,
              height: 12,
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
              fontSize: 14,
              opacity: 0.65,
              marginTop: 8,
              marginBottom: 10,
            }}
          >
            <span>{formatDate(card.completedAtIso)}</span>
            <span style={{ background: "rgba(255,255,255,0.55)", padding: "2px 10px", borderRadius: 999, fontWeight: 600 }}>
              {card.tag === "personal" ? "개인" : "업무"}
            </span>
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 10,
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
                fontSize: 17,
                lineHeight: 1.4,
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
              bottom: 10,
              right: 14,
              fontSize: 26,
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

function ScrollCamera({
  scrollContainer,
  finalZ,
}: {
  scrollContainer: React.RefObject<HTMLDivElement | null>;
  finalZ: number;
}) {
  const { camera } = useThree();
  useEffect(() => {
    if (!scrollContainer.current) return;
    camera.position.set(0, 0, 3);
    const tween = gsap.to(camera.position, {
      z: finalZ,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: scrollContainer.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [camera, scrollContainer, finalZ]);
  return null;
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
    if (ref.current) ref.current.rotation.y += dt * 0.012;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} sizeAttenuation color="#b6c7e0" transparent opacity={0.65} />
    </points>
  );
}

export function TimelineShowcase({ cards }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const { layouts, cols, rows } = useMemo(() => computeWallLayout(cards), [cards]);
  const total = cards.length;

  // 카메라 최종 거리 — 그리드 전체가 보이도록
  const cardW = 3.4;
  const cardH = 2.5;
  const stepX = cardW + 0.4;
  const stepY = cardH + 0.5;
  const gridW = cols * stepX;
  const gridH = rows * stepY;
  const fov = 55;
  const halfH = Math.max(gridH, gridW * 0.6) / 2;
  const finalZ = Math.max(11, halfH / Math.tan((fov / 2) * (Math.PI / 180)) + 2);

  const weekCount = useMemo(() => {
    const weeks = new Set<string>();
    for (const c of cards) {
      const d = new Date(c.completedAtIso);
      const ws = `${d.getFullYear()}-${Math.floor((d.getMonth() * 31 + d.getDate()) / 7)}`;
      weeks.add(ws);
    }
    return weeks.size;
  }, [cards]);

  // 히어로 타이틀 — 스크롤 진행도에 따라 페이드/축소
  useEffect(() => {
    if (!containerRef.current || !heroRef.current) return;
    const tween = gsap.to(heroRef.current, {
      opacity: 0,
      y: -50,
      scale: 0.6,
      ease: "power2.in",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "30% top",
        scrub: 1,
      },
    });
    const hint = hintRef.current
      ? gsap.fromTo(
          hintRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "80% bottom",
              end: "bottom bottom",
              scrub: 1,
            },
          },
        )
      : null;
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      hint?.scrollTrigger?.kill();
      hint?.kill();
    };
  }, []);

  // 카드 수에 따라 스크롤 길이 조정 — 카드 많으면 길게
  const scrollHeightVh = Math.min(400, 220 + total * 2);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${scrollHeightVh}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, #1a2150 0%, #0a0f25 50%, #020410 100%)",
          }}
        />
        <Canvas
          camera={{ position: [0, 0, 3], fov }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={["#020410"]} />
          <fog attach="fog" args={["#020410", 18, 50]} />
          <ambientLight intensity={0.7} />
          <pointLight position={[0, 0, 6]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[6, 8, 4]} intensity={0.8} color="#fff7d4" />
          <StarField />
          <ScrollCamera scrollContainer={containerRef} finalZ={finalZ} />
          {cards.map((card, i) => (
            <ShowcaseCardMesh
              key={card.id}
              card={card}
              layout={layouts[i]}
              scrollContainer={containerRef}
            />
          ))}
        </Canvas>

        {/* 히어로 타이틀 (스크롤 위로 페이드아웃) */}
        <div
          ref={heroRef}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        >
          <div className="text-[10px] font-semibold uppercase tracking-[8px] text-amber-300/80">
            $ completed_work
          </div>
          <div className="mt-6 text-6xl font-bold text-neutral-50 md:text-8xl">
            {total}
          </div>
          <div className="mt-3 text-2xl font-medium text-neutral-200 md:text-3xl">
            개의 일을 끝냈어요
          </div>
          <div className="mt-6 text-sm text-neutral-400">
            {weekCount}주에 걸쳐서
          </div>
          <div className="mt-12 text-xs uppercase tracking-widest text-amber-300/60">
            ↓ scroll
          </div>
        </div>

        {/* 하단 안내 (스크롤 끝에 등장) */}
        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-widest text-neutral-500 opacity-0"
        >
          호버하면 카드가 떠오릅니다
        </div>
      </div>
    </div>
  );
}
