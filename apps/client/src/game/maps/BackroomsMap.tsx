import { MapProp } from "./MapShell";

export function BackroomsMap() {
  const tileSize = 4;
  const tiles: [number, number][] = [];
  for (let x = -3; x <= 3; x++) {
    for (let z = -3; z <= 3; z++) {
      tiles.push([x * tileSize, z * tileSize]);
    }
  }

  return (
    <group>
      {tiles.map(([x, z], i) => (
        <mesh key={i} position={[x, 2.5, z]} receiveShadow>
          <boxGeometry args={[tileSize - 0.1, 0.1, tileSize - 0.1]} />
          <meshStandardMaterial color="#c4a035" roughness={0.95} />
        </mesh>
      ))}
      <MapProp position={[-8, 1.5, -8]} scale={[0.2, 3, 16]} color="#b8952e" />
      <MapProp position={[8, 1.5, -8]} scale={[0.2, 3, 16]} color="#b8952e" />
      <MapProp position={[-8, 1.5, 8]} scale={[16, 3, 0.2]} color="#b8952e" />
      <MapProp position={[-8, 1.5, -8]} scale={[16, 3, 0.2]} color="#b8952e" />
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={`light-${i}`} position={[(i % 4 - 2) * 6, 2.8, Math.floor(i / 4 - 1) * 8]}>
          <boxGeometry args={[1.5, 0.1, 0.4]} />
          <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  );
}
