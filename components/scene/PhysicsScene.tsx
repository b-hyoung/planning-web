"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Particles } from "./Particles";
import {
  PhysicsInteractionProvider,
  PhysicsInteractionTrackers,
  type AttractorMode,
} from "./PhysicsInteraction";

interface Props {
  gravity?: [number, number, number];
  attractorMode?: AttractorMode;
  children: React.ReactNode;
}

export function PhysicsScene({
  gravity = [0, 0, 0],
  attractorMode = "off",
  children,
}: Props) {
  return (
    <div
      data-physics-canvas
      className="relative h-[calc(100vh-12rem)] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#0b1023] via-[#111738] to-[#161c44]"
    >
      <PhysicsInteractionProvider attractorMode={attractorMode}>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 55 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
        >
          <fog attach="fog" args={["#161c44", 14, 50]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[6, 10, 6]} intensity={0.7} />
          <Particles count={200} />
          <Physics gravity={gravity} debug={false}>
            <PhysicsInteractionTrackers />
            {children}
          </Physics>
        </Canvas>
      </PhysicsInteractionProvider>
    </div>
  );
}
