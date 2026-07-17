"use client"

export function IVStand() {
  return (
    <group position={[1.2, 0.4, 0.6]}>
      {/* Pole */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 1.2]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Hook */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.015, 0.015]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.03]} />
        <meshStandardMaterial color="#909090" metalness={0.3} roughness={0.5} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh
            key={`base-leg-${i}`}
            position={[Math.cos(angle) * 0.15, -0.02, Math.sin(angle) * 0.15]}
            rotation={[0, 0, 0.3]}
          >
            <boxGeometry args={[0.04, 0.02, 0.18]} />
            <meshStandardMaterial color="#909090" metalness={0.3} roughness={0.5} />
          </mesh>
        );
      })}

      {/* IV Bag */}
      <mesh position={[0.15, 0.9, 0]}>
        <boxGeometry args={[0.08, 0.16, 0.03]} />
        <meshStandardMaterial
          color="#e0f0e8"
          transparent
          opacity={0.7}
          roughness={0.3}
        />
      </mesh>
      {/* Label on bag */}
      <mesh position={[0.15, 0.9, 0.025]}>
        <planeGeometry args={[0.06, 0.1]} />
        <meshBasicMaterial color="#7c8c84" />
      </mesh>
      {/* Tube */}
      <mesh position={[-0.02, 0.5, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.8]} />
        <meshStandardMaterial color="#d0d8d4" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
