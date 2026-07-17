"use client"

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { VitalSign } from "../types";
import { Room } from "./Room";
import { Bed } from "./Bed";
import { Patient } from "./Patient";
import { IVStand } from "./IVStand";
import { Monitor } from "./Monitor";

interface PatientSceneProps {
  vitalsRef: React.MutableRefObject<Record<string, VitalSign>>;
  visibleRef: React.MutableRefObject<boolean>;
  elapsedRef: React.MutableRefObject<number>;
  minutesRef: React.MutableRefObject<number>;
  secondsRef: React.MutableRefObject<number>;
  gameOverRef: React.MutableRefObject<boolean>;
}

export function PatientScene({
  vitalsRef,
  visibleRef,
  elapsedRef,
  minutesRef,
  secondsRef,
  gameOverRef,
}: PatientSceneProps) {
  const pulseRef = useRef(0);

  useFrame(() => {
    pulseRef.current += 0.04;
  });

  return (
    <group>
      {/* Controls — enable mouse interaction */}
      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        minDistance={1.5}
        maxDistance={8}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.5, 0]}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <hemisphereLight
        intensity={0.3}
        color="#87ceeb"
        groundColor="#c4bdb5"
      />
      <directionalLight
        position={[2, 4, -3]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={10}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <directionalLight
        position={[-2, 1, 2]}
        intensity={0.3}
      />

      {/* Scene elements */}
      <Room />
      <Bed />
      <Patient pulseRef={pulseRef} />
      <IVStand />
      <Monitor
        vitalsRef={vitalsRef}
        visibleRef={visibleRef}
        pulseRef={pulseRef}
        elapsedRef={elapsedRef}
        minutesRef={minutesRef}
        secondsRef={secondsRef}
      />
    </group>
  );
}
