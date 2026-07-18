"use client"

import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import * as THREE from "three";

export function Patient({ pulseRef }: { pulseRef: React.MutableRefObject<number> }) {
  const blanketRef = useRef<THREE.Mesh>(null);
  const geom = useLoader(STLLoader, "/assets/standard_male_lowpoly.stl");
  const blanket = useLoader(STLLoader, "/assets/blanket_lowpoly.stl");

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
        rotation={[-Math.PI / 2, 0, Math.PI]}
        position={[0.1, 0, 0.3]}
        scale={0.2}
        castShadow
      >
        <meshStandardMaterial color="#f5cba7" roughness={0.6} flatShading />
      </mesh>
      <mesh
        geometry={blanket}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        position={[0.1, 0.02, 0.3]}
        scale={0.2}
        castShadow
      >
        <meshStandardMaterial color="#25b6ff" roughness={0.6} flatShading />
      </mesh>

      {/* Blanket over lower body */}

    </group>
  );
}
