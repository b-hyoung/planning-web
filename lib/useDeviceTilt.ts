"use client";

import { useEffect, useState } from "react";

export type TiltPermission = "unknown" | "needs-prompt" | "granted" | "denied" | "unsupported";

interface DeviceOrientationEventStatic {
  requestPermission?: () => Promise<"granted" | "denied">;
}

/**
 * 디바이스 기울기 → 중력 벡터 [x, y, z]
 * - x: 좌우 (gamma)
 * - y: 앞뒤 (beta), 화면 좌표계 기준 위쪽(+)
 * - z: 0 (사용 안 함)
 *
 * iOS 13+ 는 사용자 명시적 권한 필요 (requestPermission).
 */
export function useDeviceTilt(enabled: boolean) {
  const [gravity, setGravity] = useState<[number, number, number]>([0, 0, 0]);
  const [permission, setPermission] = useState<TiltPermission>("unknown");

  useEffect(() => {
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") {
      setPermission("unsupported");
      return;
    }
    const Static = DeviceOrientationEvent as unknown as DeviceOrientationEventStatic;
    if (typeof Static.requestPermission === "function") {
      setPermission((prev) => (prev === "unknown" ? "needs-prompt" : prev));
    } else {
      setPermission((prev) => (prev === "unknown" ? "granted" : prev));
    }
  }, []);

  useEffect(() => {
    if (!enabled || permission !== "granted") return;
    const G = 9.81 * 0.45;
    const handler = (e: DeviceOrientationEvent) => {
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;
      const clampedBeta = Math.max(-60, Math.min(60, beta));
      const clampedGamma = Math.max(-60, Math.min(60, gamma));
      const x = Math.sin((clampedGamma * Math.PI) / 180) * G;
      const y = -Math.sin((clampedBeta * Math.PI) / 180) * G;
      setGravity([x, y, 0]);
    };
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [enabled, permission]);

  async function requestPermission() {
    if (permission === "granted" || permission === "denied") return;
    const Static = DeviceOrientationEvent as unknown as DeviceOrientationEventStatic;
    if (!Static.requestPermission) {
      setPermission("granted");
      return;
    }
    try {
      const r = await Static.requestPermission();
      setPermission(r === "granted" ? "granted" : "denied");
    } catch {
      setPermission("denied");
    }
  }

  function disable() {
    setGravity([0, 0, 0]);
  }

  return { gravity, permission, requestPermission, disable };
}
