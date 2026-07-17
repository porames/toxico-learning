"use client"

import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import * as THREE from "three";

export function Patient({ pulseRef }: { pulseRef: React.MutableRefObject<number> }) {
  const blanketRef = useRef<THREE.Mesh>(null);
  const geom = useLoader(STLLoader, "/assets/standard_male_lowpoly.stl");

  useFrame(() => {
    if (blanketRef.current) {
      const breathe = Math.sin(pulseRef.current * 2) * 0.008;
      //blanketRef.current.position.y = 0.12 + breathe;
    }
  });

  return (
    <group position={[0, 0.4, 0]}>
      {/* STL patient model — lying on the bed */}
      <mesh
        geometry={geom}
        rotation={[0, 0, Math.PI]}
        position={[0.1, 0.3, -0.7]}
        scale={0.2}
        castShadow
      >
        <meshStandardMaterial color="#f5cba7" roughness={0.6} flatShading />
      </mesh>

      {/* Blanket over lower body */}
      <mesh ref={blanketRef} position={[0, 0.2, -0.2]} castShadow>
        <boxGeometry args={[.8, 0.25, 1.5]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.33, -0.7]}>
        <boxGeometry args={[0.8, 0.04, 0.3]} />
        <meshStandardMaterial color="#3d7ab8" />
      </mesh>
    </group>
  );
}
