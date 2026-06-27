import { MapProp } from "./MapShell";

export function MansionMap() {
  return (
    <group>
      <MapProp position={[-8, 1, -8]} scale={[4, 2, 0.3]} color="#8b6914" />
      <MapProp position={[8, 1, -8]} scale={[4, 2, 0.3]} color="#6b4423" />
      <MapProp position={[-8, 1, 8]} scale={[3, 2.5, 3]} color="#4a3728" />
      <MapProp position={[8, 1, 8]} scale={[2, 1.5, 4]} color="#d4c4a8" />
      <MapProp position={[0, 0.8, 0]} scale={[2, 1.6, 1]} color="#2c1810" />
      <MapProp position={[-4, 0.5, 4]} scale={[1.5, 1, 1.5]} color="#f5f0e8" />
      <MapProp position={[4, 0.5, -4]} scale={[1.2, 0.8, 1.2]} color="#e8dcc8" />
      <MapProp position={[0, 1.2, -6]} scale={[1, 2.4, 0.8]} color="#654321" />
      <mesh position={[6, 1.5, 2]} castShadow>
        <boxGeometry args={[0.8, 3, 1.2]} />
        <meshStandardMaterial color="#3d2817" roughness={0.7} />
      </mesh>
    </group>
  );
}
