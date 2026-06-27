import { RigidBody } from "@react-three/rapier";
import type { CustomMap } from "@meccha/shared";

interface CustomMapSceneProps {
  map: CustomMap;
}

export function CustomMapScene({ map }: CustomMapSceneProps) {
  return (
    <group>
      {map.lighting?.fogColor && (
        <fog
          attach="fog"
          args={[
            map.lighting.fogColor,
            map.lighting.fogNear ?? 10,
            map.lighting.fogFar ?? 60,
          ]}
        />
      )}
      {map.objects.map((obj) => (
        <RigidBody
          key={obj.id}
          type="fixed"
          colliders={obj.collider === "box" ? "cuboid" : false}
          position={[
            obj.transform.position.x,
            obj.transform.position.y,
            obj.transform.position.z,
          ]}
          rotation={[
            obj.transform.rotation.x,
            obj.transform.rotation.y,
            obj.transform.rotation.z,
          ]}
        >
          <mesh
            scale={[
              obj.transform.scale.x,
              obj.transform.scale.y,
              obj.transform.scale.z,
            ]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={obj.material?.color ?? "#888888"}
              metalness={obj.material?.metallic ?? 0}
              roughness={obj.material?.roughness ?? 0.8}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}
