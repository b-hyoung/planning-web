"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type AttractorMode = "off" | "attract" | "repel";

interface InteractionState {
  cursor: { current: THREE.Vector3 };
  cursorActive: { current: boolean };
  wind: { current: THREE.Vector3 };
  attractorMode: { current: AttractorMode };
}

const PhysicsInteractionContext = createContext<InteractionState | null>(null);

interface ProviderProps {
  attractorMode: AttractorMode;
  children: React.ReactNode;
}

export function PhysicsInteractionProvider({ attractorMode, children }: ProviderProps) {
  const cursor = useRef(new THREE.Vector3(0, 0, -1000));
  const cursorActive = useRef(false);
  const wind = useRef(new THREE.Vector3(0, 0, 0));
  const attractorModeRef = useRef<AttractorMode>(attractorMode);

  // mode prop 이 바뀌면 ref 갱신
  useEffect(() => {
    attractorModeRef.current = attractorMode;
  }, [attractorMode]);

  // 스크롤 → 바람 임펄스 (윈도우 레벨 wheel)
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      // 캘린더 같은 다른 스크롤러 안에서 굴리면 무시 — body 직속만
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest("[data-physics-canvas]")) {
        const k = 0.06;
        wind.current.x += e.deltaX * k;
        wind.current.y -= e.deltaY * k; // 위로 스크롤 = 위로 바람
      }
    }
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <PhysicsInteractionContext.Provider
      value={{
        cursor,
        cursorActive,
        wind,
        attractorMode: attractorModeRef,
      }}
    >
      {children}
    </PhysicsInteractionContext.Provider>
  );
}

export function usePhysicsInteraction(): InteractionState {
  const ctx = useContext(PhysicsInteractionContext);
  if (!ctx) throw new Error("PhysicsInteractionProvider missing");
  return ctx;
}

/**
 * Canvas 내부에서 마우스 위치 추적 + 바람 감쇠.
 * <Canvas> 자식으로 단 한 번만 마운트.
 */
export function PhysicsInteractionTrackers() {
  const { cursor, cursorActive, wind } = usePhysicsInteraction();
  const { camera, gl } = useThree();

  // 마우스 → 월드 좌표 (z=0 평면 투영)
  useEffect(() => {
    const dom = gl.domElement;
    function project(clientX: number, clientY: number) {
      const rect = dom.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      const v = new THREE.Vector3(ndcX, ndcY, 0.5);
      v.unproject(camera);
      const dir = v.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(distance));
    }
    function onMove(e: PointerEvent) {
      cursor.current.copy(project(e.clientX, e.clientY));
      cursorActive.current = true;
    }
    function onLeave() {
      cursorActive.current = false;
    }
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerleave", onLeave);
    return () => {
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerleave", onLeave);
    };
  }, [camera, gl, cursor, cursorActive]);

  // 바람 감쇠 (매 프레임 0.92배씩 줄어듦)
  useFrame(() => {
    wind.current.multiplyScalar(0.92);
    if (wind.current.lengthSq() < 0.0001) wind.current.set(0, 0, 0);
  });

  return null;
}
