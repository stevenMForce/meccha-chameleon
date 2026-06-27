import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { RevealSnapshot } from "@meccha/shared";
import { getPoseConfig } from "../characters/Poses";

interface AnswerCheckCameraProps {
  snapshots: RevealSnapshot[];
  currentIndex: number;
  active: boolean;
}

export function AnswerCheckCamera({ snapshots, currentIndex, active }: AnswerCheckCameraProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const transition = useRef(0);

  useEffect(() => {
    transition.current = 0;
  }, [currentIndex]);

  useFrame((_, delta) => {
    if (!active || snapshots.length === 0) return;

    const snap = snapshots[currentIndex];
    if (!snap) return;

    const pose = getPoseConfig(snap.pose);
    const px = snap.position.x;
    const py = snap.position.y;
    const pz = snap.position.z;

    targetPos.current.set(px + 3, py + 2, pz + 3);
    targetLook.current.set(px, py + pose.positionOffset[1], pz);

    transition.current = Math.min(1, transition.current + delta * 1.5);
    camera.position.lerp(targetPos.current, transition.current * 0.08);
    camera.lookAt(targetLook.current);
  });

  return null;
}
