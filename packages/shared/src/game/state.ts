export const GAME_VERSION = "0.1.0";

export type GamePhase =
  | "lobby"
  | "roleAssign"
  | "preparation"
  | "hunt"
  | "answerCheck"
  | "roundEnd";

export type GameMode = "normal" | "increasingOni" | "double";

export type PlayerRole = "hider" | "seeker" | "spectator";

export type MapId =
  | "mansion"
  | "indoorCountry"
  | "sewer"
  | "backrooms"
  | "penguinHotel";

export type PoseId =
  | "stand"
  | "crouch"
  | "curl"
  | "wallFlat"
  | "lieDown"
  | "mimicFrame";

export type PaintTool = "brush" | "eyedropper" | "fill" | "clear";

export type TeamId = "hider" | "seeker";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface RoomSettings {
  mapId: MapId;
  mode: GameMode;
  prepDuration: number;
  huntDuration: number;
  whistleEnabled: boolean;
  whistleInterval: number;
  maxPlayers: number;
  isPrivate: boolean;
  roomName: string;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  mapId: "mansion",
  mode: "normal",
  prepDuration: 60,
  huntDuration: 180,
  whistleEnabled: false,
  whistleInterval: 15,
  maxPlayers: 10,
  isPrivate: false,
  roomName: "Meccha Room",
};

export const MAP_NAMES: Record<MapId, string> = {
  mansion: "Hide-and-Seek Mansion",
  indoorCountry: "Indoor Country",
  sewer: "Sewer",
  backrooms: "Backrooms",
  penguinHotel: "Penguin Hotel",
};

export const MODE_NAMES: Record<GameMode, string> = {
  normal: "Normal",
  increasingOni: "Increasing Oni",
  double: "Double",
};

export interface RevealSnapshot {
  playerId: string;
  playerName: string;
  position: Vec3;
  rotation: number;
  pose: PoseId;
  foundBy?: string;
  foundAt?: number;
  paintHash?: string;
}

export interface RoundResult {
  winnerTeam: TeamId | "draw";
  snapshots: RevealSnapshot[];
  roundNumber: number;
}
