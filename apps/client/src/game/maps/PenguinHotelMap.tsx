import { MapProp } from "./MapShell";

export function PenguinHotelMap() {
  return (
    <group>
      <MapProp position={[0, 1.5, -10]} scale={[14, 3, 0.5]} color="#ffb6c1" />
      <MapProp position={[-7, 1, 0]} scale={[0.5, 2, 10]} color="#ffc0cb" />
      <MapProp position={[7, 1, 0]} scale={[0.5, 2, 10]} color="#ffc0cb" />
      <MapProp position={[-5, 0.6, 5]} scale={[2, 1.2, 2]} color="#ffffff" />
      <MapProp position={[5, 0.6, 5]} scale={[2, 1.2, 2]} color="#ffffff" />
      <MapProp position={[0, 0.5, 0]} scale={[3, 1, 2]} color="#4169e1" />
      <mesh position={[-3, 2, -5]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#ff69b4" roughness={0.4} />
      </mesh>
      <mesh position={[3, 2, -5]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#87ceeb" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.8, 3]}>
        <boxGeometry args={[1, 1.5, 0.8]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.6} />
      </mesh>
    </group>
  );
}
