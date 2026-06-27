import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";
import type { MapId } from "@meccha/shared";
import { MAP_DATA } from "@meccha/shared";
import { MansionMap } from "./MansionMap";
import { IndoorCountryMap } from "./IndoorCountryMap";
import { SewerMap } from "./SewerMap";
import { BackroomsMap } from "./BackroomsMap";
import { PenguinHotelMap } from "./PenguinHotelMap";
import { CustomMapScene } from "./CustomMapScene";
import type { CustomMap } from "@meccha/shared";

interface MapShellProps {
  mapId: MapId | string;
  customMap?: CustomMap;
}

const MAP_COMPONENTS: Record<MapId, React.ComponentType> = {
  mansion: MansionMap,
  indoorCountry: IndoorCountryMap,
  sewer: SewerMap,
  backrooms: BackroomsMap,
  penguinHotel: PenguinHotelMap,
};

export function MapShell({ mapId, customMap }: MapShellProps) {
  const data = MAP_DATA[mapId as MapId];
  const MapComponent = MAP_COMPONENTS[mapId as MapId];

  if (customMap) {
    return <CustomMapScene map={customMap} />;
  }

  return (
    <group>
      <Floor bounds={data?.bounds} color={getFloorColor(mapId as MapId)} />
      {MapComponent ? <MapComponent /> : null}
      <BoundaryWalls bounds={data?.bounds} />
      {data?.fog && (
        <fog attach="fog" args={[data.fog.color, data.fog.near, data.fog.far]} />
      )}
    </group>
  );
}

function Floor({ bounds, color }: { bounds?: { min: { y: number }; max: { x: number; z: number; min?: never } }; color: string }) {
  const size = bounds ? Math.max(bounds.max.x * 2, 40) : 40;
  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <CuboidCollider args={[size / 2, 0.1, size / 2]} position={[0, -0.1, 0]} />
    </RigidBody>
  );
}

function BoundaryWalls({ bounds }: { bounds?: { min: { x: number; z: number }; max: { x: number; z: number } } }) {
  if (!bounds) return null;
  const w = bounds.max.x - bounds.min.x;
  const d = bounds.max.z - bounds.min.z;
  const h = 4;
  const walls = [
    { pos: [0, h / 2, bounds.min.z] as [number, number, number], size: [w, h, 0.5] as [number, number, number] },
    { pos: [0, h / 2, bounds.max.z] as [number, number, number], size: [w, h, 0.5] as [number, number, number] },
    { pos: [bounds.min.x, h / 2, 0] as [number, number, number], size: [0.5, h, d] as [number, number, number] },
    { pos: [bounds.max.x, h / 2, 0] as [number, number, number], size: [0.5, h, d] as [number, number, number] },
  ];

  return (
    <>
      {walls.map((wall, i) => (
        <RigidBody key={i} type="fixed" colliders={false}>
          <mesh position={wall.pos} receiveShadow>
            <boxGeometry args={wall.size} />
            <meshStandardMaterial color="#888" transparent opacity={0} />
          </mesh>
          <CuboidCollider args={[wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2]} position={wall.pos} />
        </RigidBody>
      ))}
    </>
  );
}

function getFloorColor(mapId: MapId): string {
  const colors: Record<MapId, string> = {
    mansion: "#c4a882",
    indoorCountry: "#8fbc6a",
    sewer: "#3a3a3a",
    backrooms: "#c4a035",
    penguinHotel: "#f0c0d0",
  };
  return colors[mapId] ?? "#888";
}

export function MapProp({
  position,
  scale = [1, 1, 1],
  color,
  texture,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  scale?: [number, number, number];
  color: string;
  texture?: THREE.Texture;
  rotation?: [number, number, number];
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <mesh castShadow receiveShadow rotation={rotation} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} map={texture} roughness={0.85} />
      </mesh>
    </RigidBody>
  );
}
