"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";

export type CameraMode = "today" | "week";

const POSITIONS: Record<CameraMode, [number, number, number]> = {
  today: [0, 0, 6.5],
  week:  [0, 1.5, 14],
};

const LOOK_AT: Record<CameraMode, [number, number, number]> = {
  today: [0, 0, 0],
  week:  [0, 0, 0],
};

export function useCameraMode(mode: CameraMode) {
  const { camera } = useThree();
  const posTweenRef = useRef<gsap.core.Tween | null>(null);
  const lookTweenRef = useRef<gsap.core.Tween | null>(null);
  const lookAtRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    posTweenRef.current?.kill();
    lookTweenRef.current?.kill();

    const target = POSITIONS[mode];
    const lookTarget = LOOK_AT[mode];

    posTweenRef.current = gsap.to(camera.position, {
      x: target[0],
      y: target[1],
      z: target[2],
      duration: 0.9,
      ease: "power3.inOut",
    });
    lookTweenRef.current = gsap.to(lookAtRef.current, {
      x: lookTarget[0],
      y: lookTarget[1],
      z: lookTarget[2],
      duration: 0.9,
      ease: "power3.inOut",
      onUpdate: () => {
        camera.lookAt(lookAtRef.current.x, lookAtRef.current.y, lookAtRef.current.z);
      },
    });

    return () => {
      posTweenRef.current?.kill();
      lookTweenRef.current?.kill();
    };
  }, [mode, camera]);
}
