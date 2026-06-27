import { create } from "zustand";
import type { Room, Client } from "colyseus.js";
import type {
  GameState,
  LobbyRoomState,
  RoomSettings,
  RevealSnapshot,
  TeamId,
  PaintStrokeMessage,
  PaintColor,
} from "@meccha/shared";
import { DEFAULT_ROOM_SETTINGS, DEFAULT_PAINT_COLOR } from "@meccha/shared";

export interface ChatEntry {
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}

interface NetworkStore {
  client: Client | null;
  lobbyRoom: Room<LobbyRoomState> | null;
  gameRoom: Room<GameState> | null;
  playerName: string;
  sessionId: string;
  isConnected: boolean;
  chatMessages: ChatEntry[];
  roundSnapshots: RevealSnapshot[];
  roundWinner: TeamId | "draw" | null;
  remoteStrokes: PaintStrokeMessage[];

  setClient: (client: Client) => void;
  setLobbyRoom: (room: Room<LobbyRoomState> | null) => void;
  setGameRoom: (room: Room<GameState> | null) => void;
  setPlayerName: (name: string) => void;
  setSessionId: (id: string) => void;
  addChatMessage: (msg: ChatEntry) => void;
  setRoundResult: (winner: TeamId | "draw", snapshots: RevealSnapshot[]) => void;
  addRemoteStroke: (stroke: PaintStrokeMessage) => void;
  clearRemoteStrokes: () => void;
  disconnect: () => void;
}

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  client: null,
  lobbyRoom: null,
  gameRoom: null,
  playerName: localStorage.getItem("meccha-name") || "Chameleon",
  sessionId: "",
  isConnected: false,
  chatMessages: [],
  roundSnapshots: [],
  roundWinner: null,
  remoteStrokes: [],

  setClient: (client) => set({ client, isConnected: true }),
  setLobbyRoom: (room) => set({ lobbyRoom: room }),
  setGameRoom: (room) => set({ gameRoom: room }),
  setPlayerName: (name) => {
    localStorage.setItem("meccha-name", name);
    set({ playerName: name });
  },
  setSessionId: (id) => set({ sessionId: id }),
  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages.slice(-50), msg] })),
  setRoundResult: (winner, snapshots) =>
    set({ roundWinner: winner, roundSnapshots: snapshots }),
  addRemoteStroke: (stroke) =>
    set((s) => ({ remoteStrokes: [...s.remoteStrokes.slice(-200), stroke] })),
  clearRemoteStrokes: () => set({ remoteStrokes: [] }),
  disconnect: () => {
    get().lobbyRoom?.leave();
    get().gameRoom?.leave();
    set({
      lobbyRoom: null,
      gameRoom: null,
      isConnected: false,
      chatMessages: [],
      roundSnapshots: [],
      roundWinner: null,
      remoteStrokes: [],
    });
  },
}));

interface SettingsStore {
  language: string;
  mouseSensitivity: number;
  volume: number;
  keyBindings: Record<string, string>;
  colorblindMode: boolean;
  voiceEnabled: boolean;
  setLanguage: (lang: string) => void;
  setMouseSensitivity: (v: number) => void;
  setVolume: (v: number) => void;
  setKeyBinding: (action: string, key: string) => void;
  setColorblindMode: (v: boolean) => void;
  setVoiceEnabled: (v: boolean) => void;
}

const DEFAULT_KEYS: Record<string, string> = {
  forward: "KeyW",
  backward: "KeyS",
  left: "KeyA",
  right: "KeyD",
  paint: "KeyF",
  pose: "KeyQ",
  shoot: "Mouse0",
  whistle: "KeyR",
  thirdPerson: "KeyV",
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  language: localStorage.getItem("meccha-lang") || "zh-TW",
  mouseSensitivity: 0.002,
  volume: 0.8,
  keyBindings: DEFAULT_KEYS,
  colorblindMode: false,
  voiceEnabled: true,
  setLanguage: (lang) => {
    localStorage.setItem("meccha-lang", lang);
    set({ language: lang });
  },
  setMouseSensitivity: (v) => set({ mouseSensitivity: v }),
  setVolume: (v) => set({ volume: v }),
  setKeyBinding: (action, key) =>
    set((s) => ({ keyBindings: { ...s.keyBindings, [action]: key } })),
  setColorblindMode: (v) => set({ colorblindMode: v }),
  setVoiceEnabled: (v) => set({ voiceEnabled: v }),
}));

interface PaintStore {
  isOpen: boolean;
  currentColor: PaintColor;
  brushSize: number;
  activeTool: "brush" | "eyedropper" | "fill" | "clear";
  isPaintingOnBody: boolean;
  setOpen: (open: boolean) => void;
  setColor: (color: Partial<PaintColor>) => void;
  setBrushSize: (size: number) => void;
  setTool: (tool: PaintStore["activeTool"]) => void;
  setPaintingOnBody: (v: boolean) => void;
}

export const usePaintStore = create<PaintStore>((set) => ({
  isOpen: false,
  currentColor: { ...DEFAULT_PAINT_COLOR },
  brushSize: 0.05,
  activeTool: "brush",
  isPaintingOnBody: false,
  setOpen: (open) => set({ isOpen: open }),
  setColor: (color) => set((s) => ({ currentColor: { ...s.currentColor, ...color } })),
  setBrushSize: (size) => set({ brushSize: size }),
  setTool: (tool) => set({ activeTool: tool }),
  setPaintingOnBody: (v) => set({ isPaintingOnBody: v }),
}));

interface LobbySettingsStore {
  settings: RoomSettings;
  updateSettings: (partial: Partial<RoomSettings>) => void;
  resetSettings: () => void;
}

export const useLobbySettingsStore = create<LobbySettingsStore>((set) => ({
  settings: { ...DEFAULT_ROOM_SETTINGS },
  updateSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),
  resetSettings: () => set({ settings: { ...DEFAULT_ROOM_SETTINGS } }),
}));

interface GameUIStore {
  showAnswerCheck: boolean;
  answerCheckIndex: number;
  poseMenuOpen: boolean;
  chatOpen: boolean;
  setShowAnswerCheck: (v: boolean) => void;
  setAnswerCheckIndex: (i: number) => void;
  setPoseMenuOpen: (v: boolean) => void;
  setChatOpen: (v: boolean) => void;
}

export const useGameUIStore = create<GameUIStore>((set) => ({
  showAnswerCheck: false,
  answerCheckIndex: 0,
  poseMenuOpen: false,
  chatOpen: false,
  setShowAnswerCheck: (v) => set({ showAnswerCheck: v }),
  setAnswerCheckIndex: (i) => set({ answerCheckIndex: i }),
  setPoseMenuOpen: (v) => set({ poseMenuOpen: v }),
  setChatOpen: (v) => set({ chatOpen: v }),
}));
