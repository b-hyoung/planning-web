"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import type { CardData } from "./CardItem";

interface Props {
  card: CardData | null;
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
      // 시작점은 멀리 (반경 18~22)
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
    // 카드를 향해 빨려 들어오는 효과 — scale 로 표현
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

function FocusScene({ card }: { card: CardData }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useEffect(() => {
    // 카메라 줌인
    gsap.fromTo(
      camera.position,
      { z: 20 },
      { z: 7, duration: 2.4, ease: "power3.out" },
    );

    // 카드 등장
    if (groupRef.current) {
      groupRef.current.scale.setScalar(0);
      groupRef.current.rotation.y = -Math.PI;
      gsap.to(groupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.6,
        delay: 0.7,
        ease: "elastic.out(1, 0.55)",
      });
      gsap.to(groupRef.current.rotation, {
        y: 0,
        duration: 1.8,
        delay: 0.7,
        ease: "power3.out",
      });
    }

    // 링 펄스
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
  }, [camera]);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.08; // 아주 천천히
    }
  });

  const tagColor = card.tag === "personal" ? "#7cb342" : "#4a90e2";

  return (
    <>
      <group ref={groupRef}>
        {/* 후광 링 */}
        <mesh ref={ringRef} position={[0, 0, -0.5]}>
          <ringGeometry args={[3.2, 3.4, 64]} />
          <meshBasicMaterial color={tagColor} transparent opacity={0.25} />
        </mesh>

        {/* 카드 메쉬 */}
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

        {/* HTML 콘텐츠 */}
        <Html
          center
          transform
          distanceFactor={4}
          position={[0, 0, 0.06]}
          style={{
            width: "520px",
            height: "320px",
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
              fontSize: 12,
              color: "#a3a3a3",
              marginBottom: 16,
              letterSpacing: 6,
              fontWeight: 600,
            }}
          >
            오늘 할 일
          </div>
          <div
            style={{
              fontSize: 46,
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

export function FocusMode({ card, open, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 풀스크린 + ESC 처리
  useEffect(() => {
    if (!open) return;

    const el = containerRef.current;
    if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }

    function onFsChange() {
      if (!document.fullscreenElement) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("keydown", onKey);

    // 오버레이 페이드 인
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

  if (!open || !card) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black"
      onClick={(e) => {
        // 카드 클릭으론 안 닫힘 — 캔버스 빈 영역 클릭은 무시
        if (e.target === containerRef.current) onClose();
      }}
    >
      <div ref={overlayRef} className="absolute inset-0 opacity-0">
        <Canvas
          camera={{ position: [0, 0, 20], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={["#020410"]} />
          <fog attach="fog" args={["#020410", 8, 28]} />
          <ambientLight intensity={0.35} />
          <pointLight position={[0, 0, 5]} intensity={3} color="#ffffff" />
          <pointLight position={[-10, 6, 3]} intensity={1.5} color="#4a90e2" />
          <pointLight position={[10, -6, 3]} intensity={1.5} color="#7cb342" />
          <FocusScene card={card} />
        </Canvas>
      </div>

      {/* 종료 안내 */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium tracking-widest text-neutral-400">
        ESC 키 / 클릭으로 나가기
      </div>

      {/* 닫기 X 버튼 */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur hover:bg-white/20"
        aria-label="포커스 모드 종료"
      >
        ✕
      </button>
    </div>
  );
}
