import { z } from "zod";
import type { GameMode, MapId, PoseId, PaintTool } from "../game/state.js";

export const paintStrokeSchema = z.object({
  playerId: z.string(),
  uvX: z.number().min(0).max(1),
  uvY: z.number().min(0).max(1),
  radius: z.number().min(0.001).max(0.5),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  metallic: z.number().min(0).max(1),
  roughness: z.number().min(0).max(1),
  tool: z.enum(["brush", "eyedropper", "fill", "clear"] satisfies [PaintTool, ...PaintTool[]]),
});

export const poseChangeSchema = z.object({
  pose: z.enum([
    "stand",
    "crouch",
    "curl",
    "wallFlat",
    "lieDown",
    "mimicFrame",
  ] satisfies [PoseId, ...PoseId[]]),
});

export const shootSchema = z.object({
  origin: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  direction: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  timestamp: z.number(),
});

export const playerMoveSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  rotationY: z.number(),
  velocityX: z.number().optional(),
  velocityZ: z.number().optional(),
});

export const chatMessageSchema = z.object({
  text: z.string().min(1).max(200),
});

export const roomSettingsSchema = z.object({
  mapId: z.enum([
    "mansion",
    "indoorCountry",
    "sewer",
    "backrooms",
    "penguinHotel",
  ] satisfies [MapId, ...MapId[]]),
  mode: z.enum(["normal", "increasingOni", "double"] satisfies [GameMode, ...GameMode[]]),
  prepDuration: z.number().min(15).max(300),
  huntDuration: z.number().min(30).max(600),
  whistleEnabled: z.boolean(),
  whistleInterval: z.number().min(5).max(60),
  maxPlayers: z.number().min(2).max(24),
  isPrivate: z.boolean(),
  roomName: z.string().min(1).max(50),
});

export const paintSnapshotSchema = z.object({
  playerId: z.string(),
  imageData: z.string(),
  width: z.number(),
  height: z.number(),
});

export type PaintStrokeMessage = z.infer<typeof paintStrokeSchema>;
export type PoseChangeMessage = z.infer<typeof poseChangeSchema>;
export type ShootMessage = z.infer<typeof shootSchema>;
export type PlayerMoveMessage = z.infer<typeof playerMoveSchema>;
export type ChatMessagePayload = z.infer<typeof chatMessageSchema>;
export type RoomSettingsPayload = z.infer<typeof roomSettingsSchema>;
export type PaintSnapshotMessage = z.infer<typeof paintSnapshotSchema>;

export const CLIENT_MESSAGES = {
  PAINT_STROKE: "paintStroke",
  POSE_CHANGE: "poseChange",
  SHOOT: "shoot",
  MOVE: "move",
  CHAT: "chat",
  WHISTLE: "whistle",
  READY: "ready",
  START_GAME: "startGame",
  UPDATE_SETTINGS: "updateSettings",
  PAINT_SNAPSHOT: "paintSnapshot",
  NEXT_ROUND: "nextRound",
  RETURN_LOBBY: "returnLobby",
  EMOTE: "emote",
} as const;

export const SERVER_MESSAGES = {
  HIT: "hit",
  PAINT_STROKE: "paintStroke",
  PAINT_SNAPSHOT: "paintSnapshot",
  CHAT: "chat",
  ROUND_RESULT: "roundResult",
  WHISTLE: "whistle",
  ERROR: "error",
  START_GAME: "startGame",
} as const;
