import { MapProp } from "./MapShell";

export function SewerMap() {
  return (
    <group>
      <MapProp position={[-10, 1, 0]} scale={[0.8, 2, 8]} color="#555555" />
      <MapProp position={[10, 1, 0]} scale={[0.8, 2, 8]} color="#555555" />
      <MapProp position={[0, 1, -10]} scale={[8, 2, 0.8]} color="#444444" />
      <MapProp position={[0, 1, 10]} scale={[8, 2, 0.8]} color="#444444" />
      <MapProp position={[-5, 0.6, -5]} scale={[1, 1.2, 1]} color="#333333" />
      <MapProp position={[5, 0.6, 5]} scale={[1, 1.2, 1]} color="#2a2a2a" />
      <MapProp position={[0, 0.5, 0]} scale={[2, 1, 2]} color="#1a1a1a" />
      <mesh position={[-8, 1.5, 8]}>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial color="#ff6600" emissive="#331100" roughness={0.95} />
      </mesh>
    </group>
  );
}
