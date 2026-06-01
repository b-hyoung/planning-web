"use client";

import { CuboidCollider } from "@react-three/rapier";

/**
 * 보이지 않는 6면 벽 — 카드가 시야 밖으로 빠져나가지 않게.
 * 박스 안에 카드들이 떠다님.
 */
export function PhysicsBoundary() {
  const W = 14; // 좌우
  const H = 8;  // 상하
  const D = 8;  // 앞뒤
  const t = 0.5; // 벽 두께

  return (
    <>
      {/* 좌측 벽 */}
      <CuboidCollider args={[t, H, D]} position={[-W, 0, 0]} />
      {/* 우측 벽 */}
      <CuboidCollider args={[t, H, D]} position={[W, 0, 0]} />
      {/* 위 */}
      <CuboidCollider args={[W, t, D]} position={[0, H, 0]} />
      {/* 아래 */}
      <CuboidCollider args={[W, t, D]} position={[0, -H, 0]} />
      {/* 뒤 */}
      <CuboidCollider args={[W, H, t]} position={[0, 0, -D]} />
      {/* 앞 (카메라 쪽) */}
      <CuboidCollider args={[W, H, t]} position={[0, 0, D]} />
    </>
  );
}
