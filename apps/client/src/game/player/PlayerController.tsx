import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { CLIENT_MESSAGES, type PoseId } from "@meccha/shared";
import { ChameleonCharacter } from "../characters/ChameleonCharacter";
import { PaintEngine } from "../painting/PaintEngine";
import { useNetworkStore, useSettingsStore, usePaintStore, useGameUIStore } from "../../stores";

interface PlayerControllerProps {
  sessionId: string;
  role: string;
  pose: PoseId;
  phase: string;
  initialPosition: [number, number, number];
  paintEngine: PaintEngine;
}

const MOVE_SPEED = 5;
const SENSITIVITY_DEFAULT = 0.002;

export function PlayerController({
  sessionId,
  role,
  pose,
  phase,
  initialPosition,
  paintEngine,
}: PlayerControllerProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const groupRef = useRef<THREE.Group>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const rotationY = useRef(0);
  const thirdPerson = useRef(true);
  const { camera } = useThree();
  const gameRoom = useNetworkStore((s) => s.gameRoom);
  const sensitivity = useSettingsStore((s) => s.mouseSensitivity);
  const keyBindings = useSettingsStore((s) => s.keyBindings);
  const paintOpen = usePaintStore((s) => s.isOpen);
  const isPointerLocked = useRef(false);

  const canMove =
    phase === "preparation" ||
    phase === "hunt" ||
    (role === "seeker" && phase === "hunt");

  const isSeekerLocked = role === "seeker" && phase === "preparation";

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      if (e.code === keyBindings.paint) {
        e.preventDefault();
        usePaintStore.getState().setOpen(!usePaintStore.getState().isOpen);
      }
      if (e.code === keyBindings.pose && role === "hider" && canMove) {
        e.preventDefault();
        const { poseMenuOpen, setPoseMenuOpen } = useGameUIStore.getState();
        setPoseMenuOpen(!poseMenuOpen);
      }
      if (e.code === keyBindings.thirdPerson) {
        e.preventDefault();
        thirdPerson.current = !thirdPerson.current;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;
      rotationY.current -= e.movementX * (sensitivity || SENSITIVITY_DEFAULT);
    };
    const onClick = () => {
      if (!paintOpen && phase !== "lobby") {
        document.body.requestPointerLock();
      }
    };
    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === document.body;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onPointerLockChange);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    };
  }, [keyBindings, paintOpen, phase, sensitivity, role, canMove]);

  const sendMove = useCallback(
    (x: number, y: number, z: number, rot: number) => {
      gameRoom?.send(CLIENT_MESSAGES.MOVE, {
        x,
        y,
        z,
        rotationY: rot,
      });
    },
    [gameRoom],
  );

  useFrame(() => {
    const body = bodyRef.current;
    const group = groupRef.current;
    if (!body || !group) return;

    if (isSeekerLocked) {
      body.setLinvel({ x: 0, y: body.linvel().y, z: 0 }, true);
      return;
    }

    if (!canMove) {
      body.setLinvel({ x: 0, y: body.linvel().y, z: 0 }, true);
      return;
    }

    const keys = keysRef.current;
    let dx = 0;
    let dz = 0;

    if (keys[keyBindings.forward]) dz -= 1;
    if (keys[keyBindings.backward]) dz += 1;
    if (keys[keyBindings.left]) dx -= 1;
    if (keys[keyBindings.right]) dx += 1;

    const angle = rotationY.current;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const vx = (dx * cos + dz * sin) * MOVE_SPEED;
    const vz = (-dx * sin + dz * cos) * MOVE_SPEED;

    body.setLinvel({ x: vx, y: body.linvel().y, z: vz }, true);
    group.rotation.y = angle;

    const pos = body.translation();
    sendMove(pos.x, pos.y, pos.z, angle);

    const camOffset = thirdPerson.current
      ? new THREE.Vector3(0, 2, 4).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)
      : new THREE.Vector3(0, 1.6, 0.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

    camera.position.lerp(
      new THREE.Vector3(pos.x + camOffset.x, pos.y + camOffset.y, pos.z + camOffset.z),
      0.15,
    );

    const lookTarget = thirdPerson.current
      ? new THREE.Vector3(pos.x, pos.y + 0.8, pos.z)
      : new THREE.Vector3(
          pos.x - Math.sin(angle) * 10,
          pos.y + 1.6,
          pos.z - Math.cos(angle) * 10,
        );
    camera.lookAt(lookTarget);
  });

  return (
    <RigidBody
      ref={bodyRef}
      position={initialPosition}
      enabledRotations={[false, false, false]}
      colliders={false}
      linearDamping={8}
    >
      <CapsuleCollider args={[0.45, 0.35]} />
      <group ref={groupRef} position={[0, 0.38, 0]}>
        <ChameleonCharacter
          playerId={sessionId}
          pose={pose}
          isLocal
          paintEngine={paintEngine}
          name={useNetworkStore.getState().playerName}
          role={role}
        />
      </group>
    </RigidBody>
  );
}
