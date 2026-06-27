import type { PoseId } from "@meccha/shared";

export interface PoseConfig {
  id: PoseId;
  labelKey: string;
  scale: [number, number, number];
  rotation: [number, number, number];
  positionOffset: [number, number, number];
}

export const POSES: PoseConfig[] = [
  {
    id: "stand",
    labelKey: "pose.stand",
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    positionOffset: [0, 0, 0],
  },
  {
    id: "crouch",
    labelKey: "pose.crouch",
    scale: [1, 0.6, 1],
    rotation: [0, 0, 0],
    positionOffset: [0, -0.35, 0],
  },
  {
    id: "curl",
    labelKey: "pose.curl",
    scale: [0.8, 0.5, 0.8],
    rotation: [0.3, 0, 0],
    positionOffset: [0, -0.4, 0.2],
  },
  {
    id: "wallFlat",
    labelKey: "pose.wallFlat",
    scale: [0.3, 1.2, 1],
    rotation: [0, 0, 0],
    positionOffset: [0, 0, -0.3],
  },
  {
    id: "lieDown",
    labelKey: "pose.lieDown",
    scale: [1, 0.3, 1],
    rotation: [Math.PI / 2, 0, 0],
    positionOffset: [0, -0.5, 0],
  },
  {
    id: "mimicFrame",
    labelKey: "pose.mimicFrame",
    scale: [0.9, 1.1, 0.15],
    rotation: [0, 0, 0],
    positionOffset: [0, 0.2, 0],
  },
];

export function getPoseConfig(poseId: PoseId): PoseConfig {
  return POSES.find((p) => p.id === poseId) ?? POSES[0];
}
