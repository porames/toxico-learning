"use client"

export function Bed() {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Frame */}
      <mesh position={[0, -0.28, 0]} castShadow>
        <boxGeometry args={[0.9, 0.06, 2.2]} />
        <meshStandardMaterial color="#888888" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Frame rails */}
      <mesh position={[0, -0.1, 1.05]}>
        <boxGeometry args={[0.06, 0.08, 0.04]} />
        <meshStandardMaterial color="#888888" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.1, -1.05]}>
        <boxGeometry args={[0.06, 0.08, 0.04]} />
        <meshStandardMaterial color="#888888" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[-0.4, 0.4].map((x) =>
        [-0.9, 0.9].map((z) => (
          <mesh key={`leg-${x}-${z}`} position={[x, -0.38, z]} castShadow>
            <cylinderGeometry args={[0.02, 0.025, 0.2]} />
            <meshStandardMaterial color="#777777" metalness={0.3} roughness={0.7} />
          </mesh>
        )),
      )}

      {/* Mattress */}
      <mesh position={[0, 0.04, 0]} castShadow>
        <boxGeometry args={[0.86, 0.12, 2.16]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Pillow */}
      <mesh position={[0, 0.14, 0.9]}>
        <boxGeometry args={[0.55, 0.06, 0.35]} />
        <meshStandardMaterial color="#f0ead6" />
      </mesh>
    </group>
  );
}
