"use client"

import * as THREE from "three";

export function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#c4bdb5" />
      </mesh>

      {/* Baseboard */}
      <mesh position={[0, 0.05, -3.95]}>
        <boxGeometry args={[10, 0.1, 0.08]} />
        <meshStandardMaterial color="#a89f96" />
      </mesh>


    </group>
  );
}
