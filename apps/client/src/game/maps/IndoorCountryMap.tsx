import { MapProp } from "./MapShell";

export function IndoorCountryMap() {
  return (
    <group>
      <MapProp position={[-6, 1.5, -6]} scale={[0.3, 3, 2]} color="#8b4513" />
      <MapProp position={[6, 1.5, -6]} scale={[0.3, 3, 2]} color="#8b4513" />
      <MapProp position={[-6, 0.6, 6]} scale={[2, 1.2, 1]} color="#daa520" />
      <MapProp position={[6, 0.6, 6]} scale={[2, 1.2, 1]} color="#daa520" />
      <MapProp position={[0, 0.8, 0]} scale={[3, 1.6, 2]} color="#90ee90" />
      <MapProp position={[-3, 0.4, -3]} scale={[1.5, 0.8, 1.5]} color="#f4e4bc" />
      <MapProp position={[3, 0.4, 3]} scale={[1.5, 0.8, 1.5]} color="#228b22" />
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[12, 0.2, 12]} />
        <meshStandardMaterial color="#87ceeb" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
}
