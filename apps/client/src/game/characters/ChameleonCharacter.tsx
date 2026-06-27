import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PoseId } from "@meccha/shared";
import { PaintEngine } from "../painting/PaintEngine";
import { getPoseConfig } from "./Poses";
import { useNetworkStore } from "../../stores";

interface ChameleonCharacterProps {
  playerId: string;
  pose: PoseId;
  isLocal?: boolean;
  paintEngine?: PaintEngine;
  remoteTexture?: THREE.CanvasTexture | null;
  name?: string;
  role?: string;
}

interface LimbProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  radius: number;
  length: number;
  materialProps: Record<string, unknown>;
  playerId: string;
  part: string;
}

function Limb({
  position,
  rotation = [0, 0, 0],
  radius,
  length,
  materialProps,
  playerId,
  part,
}: LimbProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow userData={{ playerId, part }}>
        <capsuleGeometry args={[radius, length, 6, 12]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
    </group>
  );
}

export function ChameleonCharacter({
  playerId,
  pose,
  isLocal = false,
  paintEngine,
  remoteTexture,
  name,
  role,
}: ChameleonCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const poseConfig = getPoseConfig(pose);
  const remoteStrokes = useNetworkStore((s) => s.remoteStrokes);

  const localMaterials = useMemo(() => {
    if (!paintEngine) return null;
    const mats = paintEngine.getMaterials();
    return {
      map: mats.map,
      metalnessMap: mats.metalnessMap,
      roughnessMap: mats.roughnessMap,
    };
  }, [paintEngine]);

  useEffect(() => {
    if (isLocal || !remoteTexture) return;
    for (const stroke of remoteStrokes) {
      if (stroke.playerId === playerId) {
        // remote strokes applied via shared paint engine instances on parent
      }
    }
  }, [remoteStrokes, playerId, isLocal, remoteTexture]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.scale.set(...poseConfig.scale);
      groupRef.current.rotation.set(...poseConfig.rotation);
      groupRef.current.position.set(...poseConfig.positionOffset);
    }
  });

  const materialProps = localMaterials
    ? {
        map: localMaterials.map,
        metalnessMap: localMaterials.metalnessMap,
        roughnessMap: localMaterials.roughnessMap,
        metalness: 1,
        roughness: 1,
      }
    : remoteTexture
      ? { map: remoteTexture, metalness: 0, roughness: 0.8 }
      : { color: "#ffffff", metalness: 0, roughness: 0.8 };

  return (
    <group ref={groupRef} userData={{ playerId, isPaintTarget: isLocal }}>
      {/* torso */}
      <mesh castShadow receiveShadow userData={{ playerId, part: "body" }}>
        <capsuleGeometry args={[0.32, 0.72, 8, 16]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* head + snout */}
      <mesh position={[0, 0.62, 0.08]} castShadow userData={{ playerId, part: "head" }}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh position={[0, 0.58, 0.32]} rotation={[0.35, 0, 0]} castShadow userData={{ playerId, part: "snout" }}>
        <capsuleGeometry args={[0.1, 0.22, 6, 10]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* tail */}
      <mesh position={[0, 0.05, -0.42]} rotation={[0.55, 0, 0]} castShadow userData={{ playerId, part: "tail" }}>
        <capsuleGeometry args={[0.08, 0.55, 6, 10]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* arms — angled outward from shoulders */}
      <Limb
        position={[-0.42, 0.22, 0.02]}
        rotation={[0.15, 0, 0.75]}
        radius={0.09}
        length={0.38}
        materialProps={materialProps}
        playerId={playerId}
        part="armL"
      />
      <Limb
        position={[-0.62, -0.02, 0.06]}
        rotation={[0.35, 0, 0.45]}
        radius={0.07}
        length={0.32}
        materialProps={materialProps}
        playerId={playerId}
        part="forearmL"
      />
      <mesh position={[-0.78, -0.18, 0.1]} castShadow userData={{ playerId, part: "handL" }}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      <Limb
        position={[0.42, 0.22, 0.02]}
        rotation={[0.15, 0, -0.75]}
        radius={0.09}
        length={0.38}
        materialProps={materialProps}
        playerId={playerId}
        part="armR"
      />
      <Limb
        position={[0.62, -0.02, 0.06]}
        rotation={[0.35, 0, -0.45]}
        radius={0.07}
        length={0.32}
        materialProps={materialProps}
        playerId={playerId}
        part="forearmR"
      />
      <mesh position={[0.78, -0.18, 0.1]} castShadow userData={{ playerId, part: "handR" }}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* legs — spread wider, hang below torso */}
      <Limb
        position={[-0.26, -0.28, 0.04]}
        rotation={[0.12, 0, 0.18]}
        radius={0.11}
        length={0.42}
        materialProps={materialProps}
        playerId={playerId}
        part="legL"
      />
      <Limb
        position={[-0.28, -0.62, 0.1]}
        rotation={[0.25, 0, 0.08]}
        radius={0.09}
        length={0.28}
        materialProps={materialProps}
        playerId={playerId}
        part="shinL"
      />
      <mesh position={[-0.3, -0.82, 0.16]} rotation={[0.2, 0, 0]} castShadow userData={{ playerId, part: "footL" }}>
        <capsuleGeometry args={[0.08, 0.14, 6, 10]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      <Limb
        position={[0.26, -0.28, 0.04]}
        rotation={[0.12, 0, -0.18]}
        radius={0.11}
        length={0.42}
        materialProps={materialProps}
        playerId={playerId}
        part="legR"
      />
      <Limb
        position={[0.28, -0.62, 0.1]}
        rotation={[0.25, 0, -0.08]}
        radius={0.09}
        length={0.28}
        materialProps={materialProps}
        playerId={playerId}
        part="shinR"
      />
      <mesh position={[0.3, -0.82, 0.16]} rotation={[0.2, 0, 0]} castShadow userData={{ playerId, part: "footR" }}>
        <capsuleGeometry args={[0.08, 0.14, 6, 10]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {name && role !== "seeker" && (
        <mesh position={[0, 1.2, 0]}>
          <planeGeometry args={[1.2, 0.3]} />
          <meshBasicMaterial color={role === "seeker" ? "#ff5050" : "#50c850"} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}
