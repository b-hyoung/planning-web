"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

/** 외곽에서 카드 쪽으로 빨려 들어오는 입자들 */
function ConvergingParticles() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 600;

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 18 + Math.random() * 4;
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
        s: 0.18,
        duration: 3,
        ease: "power2.inOut",
        onUpdate: () => {
          if (ref.current) ref.current.scale.setScalar(obj.s);
        },
      },
    );
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.05;
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

function FocusScene({ card, index, total }: { card: CardData; index: number; total: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useEffect(() => {
    gsap.fromTo(
      camera.position,
      { z: 18 },
      { z: 7, duration: 1.6, ease: "power3.out" },
    );

    if (groupRef.current) {
      groupRef.current.scale.setScalar(0);
      groupRef.current.rotation.y = -Math.PI / 2;
      gsap.to(groupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.2,
        delay: 0.3,
        ease: "elastic.out(1, 0.6)",
      });
      gsap.to(groupRef.current.rotation, {
        y: 0,
        duration: 1.4,
        delay: 0.3,
        ease: "power3.out",
      });
    }

    if (ringRef.current) {
      gsap.to(ringRef.current.scale, {
        x: 1.18,
        y: 1.18,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, [camera, card.id]);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.08;
    }
  });

  const tagColor = card.tag === "personal" ? "#7cb342" : "#4a90e2";

  return (
    <>
      <group ref={groupRef}>
        <mesh ref={ringRef} position={[0, 0, -0.5]}>
          <ringGeometry args={[3.2, 3.4, 64]} />
          <meshBasicMaterial color={tagColor} transparent opacity={0.25} />
        </mesh>

        <mesh>
          <planeGeometry args={[5, 3]} />
          <meshStandardMaterial
            color={tagColor}
            emissive={tagColor}
            emissiveIntensity={0.35}
            metalness={0.25}
            roughness={0.45}
          />
        </mesh>

        <Html
          center
          transform
          distanceFactor={4}
          position={[0, 0, 0.06]}
          style={{
            width: "540px",
            height: "340px",
            background: "rgba(255, 255, 255, 0.98)",
            borderLeft: `14px solid ${tagColor}`,
            borderRadius: "22px",
            padding: "44px 48px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            pointerEvents: "none",
            boxShadow: `0 40px 120px rgba(0,0,0,0.8), 0 0 80px ${tagColor}55`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#a3a3a3",
                letterSpacing: 6,
                fontWeight: 600,
              }}
            >
              오늘 할 일
            </div>
            <div
              style={{
                fontSize: 13,
                color: tagColor,
                fontWeight: 700,
              }}
            >
              {index + 1} / {total}
            </div>
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: "#0a0a0a",
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            {card.title}
          </div>
          {card.memo && (
            <p
              style={{
                fontSize: 17,
                color: "#525252",
                lineHeight: 1.55,
                whiteSpace: "pre-line",
              }}
            >
              {card.memo}
            </p>
          )}
        </Html>
      </group>

      <ConvergingParticles />
    </>
  );
}

interface QueueStripProps {
  queue: CardData[];
}

function QueueStrip({ queue }: QueueStripProps) {
  if (queue.length === 0) return null;
  return (
    <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 flex max-w-[80vw] gap-2 overflow-hidden">
      {queue.slice(0, 6).map((c) => {
        const color = c.tag === "personal" ? "#7cb342" : "#4a90e2";
        return (
          <div
            key={c.id}
            className="rounded-md bg-white/10 px-3 py-1.5 text-[11px] text-white backdrop-blur"
            style={{ borderLeft: `4px solid ${color}` }}
          >
            <span className="truncate inline-block max-w-[120px] align-middle">{c.title}</span>
          </div>
        );
      })}
      {queue.length > 6 && (
        <div className="rounded-md bg-white/10 px-3 py-1.5 text-[11px] text-white/70 backdrop-blur">
          +{queue.length - 6}
        </div>
      )}
    </div>
  );
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
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  // 끝나면 모두 비움 (재진입 시 깨끗하게)
  useEffect(() => {
    if (!open) {
      setSkipped(new Set());
      setCompleted(new Set());
    }
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

  // 남은 카드 = 완료 안 됨 + 스킵 안 됨 (스킵은 카운트는 됨)
  const available = useMemo(
    () => cards.filter((c) => !completed.has(c.id)),
    [cards, completed],
  );
  const focusable = useMemo(
    () => available.filter((c) => !skipped.has(c.id)),
    [available, skipped],
  );
  const current = focusable[0] ?? available[0] ?? null;
  const queue = focusable.slice(1);
  const total = cards.length;
  const currentIndex =
    current && total > 0 ? completed.size + (skipped.has(current.id) ? skipped.size : 0) : 0;

  function handleComplete() {
    if (!current) return;
    const id = current.id;
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

  function handleSkip() {
    if (!current) return;
    setSkipped((prev) => {
      const next = new Set(prev);
      next.add(current.id);
      return next;
    });
  }

  if (!open) return null;
  if (cards.length === 0) {
    // 카드 없이 열린 케이스 — 빈 메시지
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

  const allDone = available.length === 0; // 전부 완료
  const stuckOnSkipped = !current && skipped.size > 0; // 남은 게 다 스킵된 상태

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black"
    >
      <div ref={overlayRef} className="absolute inset-0 opacity-0">
        {!allDone && current && (
          <Canvas
            key={current.id}
            camera={{ position: [0, 0, 18], fov: 50 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={["#020410"]} />
            <fog attach="fog" args={["#020410", 8, 28]} />
            <ambientLight intensity={0.35} />
            <pointLight position={[0, 0, 5]} intensity={3} color="#ffffff" />
            <pointLight position={[-10, 6, 3]} intensity={1.5} color="#4a90e2" />
            <pointLight position={[10, -6, 3]} intensity={1.5} color="#7cb342" />
            <FocusScene card={current} index={completed.size} total={total} />
          </Canvas>
        )}
      </div>

      {/* 진행 바 */}
      {!allDone && (
        <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2">
          <div className="flex items-center gap-1.5">
            {cards.map((c) => {
              const isDone = completed.has(c.id);
              const isCurrent = current?.id === c.id;
              return (
                <span
                  key={c.id}
                  className={
                    "h-1.5 rounded-full transition-all " +
                    (isDone
                      ? "w-6 bg-emerald-500"
                      : isCurrent
                      ? "w-10 bg-white"
                      : "w-6 bg-white/20")
                  }
                />
              );
            })}
          </div>
          <div className="mt-2 text-center text-[10px] uppercase tracking-widest text-neutral-400">
            {completed.size} / {total} 완료
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      {!allDone && current && (
        <div className="absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          <button
            onClick={handleComplete}
            disabled={pending}
            className="rounded-full bg-emerald-500 px-7 py-3 text-sm font-semibold text-white shadow-2xl shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            ✓ 완료
          </button>
          {focusable.length > 1 && (
            <button
              onClick={handleSkip}
              className="rounded-full bg-white/10 px-5 py-3 text-sm text-white/90 backdrop-blur hover:bg-white/20"
            >
              건너뛰기 →
            </button>
          )}
        </div>
      )}

      {!allDone && <QueueStrip queue={queue} />}

      {/* 모두 완료 / 모두 스킵 */}
      {allDone && <CelebrationOverlay onClose={onClose} />}
      {stuckOnSkipped && !allDone && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white">
          <div className="text-2xl">남은 카드 모두 건너뛰었어요</div>
          <button
            onClick={() => setSkipped(new Set())}
            className="mt-4 rounded-lg bg-white/10 px-5 py-2 text-sm hover:bg-white/20"
          >
            다시 보기
          </button>
          <button
            onClick={onClose}
            className="mt-2 text-xs text-neutral-400 hover:text-white"
          >
            나가기
          </button>
        </div>
      )}

      {/* 종료 안내 */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-widest text-neutral-500">
        ESC 로 나가기
      </div>

      {/* 닫기 */}
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
