import type { MapId, Vec3 } from "../game/state.js";

export interface MapSpawnData {
  id: MapId;
  hiderSpawns: Vec3[];
  seekerSpawns: Vec3[];
  bounds: { min: Vec3; max: Vec3 };
  ambientColor: string;
  fog?: { color: string; near: number; far: number };
}

export const MAP_DATA: Record<MapId, MapSpawnData> = {
  mansion: {
    id: "mansion",
    hiderSpawns: [
      { x: -8, y: 0, z: -8 },
      { x: 8, y: 0, z: -8 },
      { x: -8, y: 0, z: 8 },
      { x: 8, y: 0, z: 8 },
      { x: 0, y: 0, z: 0 },
    ],
    seekerSpawns: [{ x: 0, y: 0, z: -15 }],
    bounds: { min: { x: -20, y: -1, z: -20 }, max: { x: 20, y: 8, z: 20 } },
    ambientColor: "#fff8f0",
  },
  indoorCountry: {
    id: "indoorCountry",
    hiderSpawns: [
      { x: -6, y: 0, z: -6 },
      { x: 6, y: 0, z: -6 },
      { x: -6, y: 0, z: 6 },
      { x: 6, y: 0, z: 6 },
    ],
    seekerSpawns: [{ x: 0, y: 0, z: -12 }],
    bounds: { min: { x: -15, y: -1, z: -15 }, max: { x: 15, y: 6, z: 15 } },
    ambientColor: "#f5ffe8",
  },
  sewer: {
    id: "sewer",
    hiderSpawns: [
      { x: -10, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      { x: 0, y: 0, z: -10 },
      { x: 0, y: 0, z: 10 },
    ],
    seekerSpawns: [{ x: 0, y: 0, z: -18 }],
    bounds: { min: { x: -25, y: -2, z: -25 }, max: { x: 25, y: 5, z: 25 } },
    ambientColor: "#2a2a2a",
    fog: { color: "#1a1a1a", near: 5, far: 40 },
  },
  backrooms: {
    id: "backrooms",
    hiderSpawns: [
      { x: -5, y: 0, z: -5 },
      { x: 5, y: 0, z: -5 },
      { x: -5, y: 0, z: 5 },
      { x: 5, y: 0, z: 5 },
      { x: 0, y: 0, z: 0 },
    ],
    seekerSpawns: [{ x: 0, y: 0, z: -20 }],
    bounds: { min: { x: -30, y: -1, z: -30 }, max: { x: 30, y: 4, z: 30 } },
    ambientColor: "#c4a035",
    fog: { color: "#b8952e", near: 10, far: 60 },
  },
  penguinHotel: {
    id: "penguinHotel",
    hiderSpawns: [
      { x: -7, y: 0, z: -7 },
      { x: 7, y: 0, z: -7 },
      { x: -7, y: 0, z: 7 },
      { x: 7, y: 0, z: 7 },
    ],
    seekerSpawns: [{ x: 0, y: 0, z: -14 }],
    bounds: { min: { x: -18, y: -1, z: -18 }, max: { x: 18, y: 7, z: 18 } },
    ambientColor: "#ffe8f5",
  },
};
