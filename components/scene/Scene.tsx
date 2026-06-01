"use client";

import { Canvas } from "@react-three/fiber";
import { Particles } from "./Particles";

interface Props {
  children: React.ReactNode;
}

export function Scene({ children }: Props) {
  return (
    <div className="relative h-[calc(100vh-12rem)] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#0b1023] via-[#111738] to-[#161c44]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
      >
        <fog attach="fog" args={["#161c44", 12, 40]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={0.6} />
        <Particles count={250} />
        {children}
      </Canvas>
    </div>
  );
}
