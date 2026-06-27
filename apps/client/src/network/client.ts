import { Client } from "colyseus.js";
import type { Room } from "colyseus.js";
import {
  CLIENT_MESSAGES,
  SERVER_MESSAGES,
  GameState,
  LobbyRoomState,
  type RoomSettings,
  type PaintStrokeMessage,
} from "@meccha/shared";
import { useNetworkStore } from "../stores";

const COLYSEUS_URL =
  import.meta.env.VITE_COLYSEUS_URL || `ws://${window.location.hostname}:2567`;

let clientInstance: Client | null = null;
let lobbyListenersAttached = false;

/** Wait until Colyseus has decoded state.players and the local session is present. */
function waitForLocalPlayer(room: Room<GameState>, timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const ready = () => Boolean(room.state?.players?.get(room.sessionId));

    if (ready()) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error("Game state sync timeout"));
    }, timeoutMs);

    const onChange = () => {
      if (!ready()) return;
      clearTimeout(timer);
      room.onStateChange.remove(onChange);
      resolve();
    };

    room.onStateChange(onChange);
  });
}

export function getClient(): Client {
  if (!clientInstance) {
    clientInstance = new Client(COLYSEUS_URL);
    useNetworkStore.getState().setClient(clientInstance);
  }
  return clientInstance;
}

/** Leave current game room and reset related client state. */
export async function leaveCurrentGame(): Promise<void> {
  const { gameRoom } = useNetworkStore.getState();
  if (!gameRoom) return;

  try {
    await gameRoom.leave(true);
  } catch {
    // already disconnected
  }

  useNetworkStore.getState().setGameRoom(null);
  useNetworkStore.getState().setSessionId("");
  useNetworkStore.setState({ remoteStrokes: [], roundSnapshots: [], roundWinner: null });
}

/** Leave current lobby and reset related client state before joining another room. */
export async function leaveCurrentLobby(): Promise<void> {
  const { lobbyRoom } = useNetworkStore.getState();
  if (!lobbyRoom) return;

  lobbyListenersAttached = false;
  try {
    await lobbyRoom.leave(true);
  } catch {
    // already disconnected
  }

  useNetworkStore.getState().setLobbyRoom(null);
  useNetworkStore.getState().setSessionId("");
  useNetworkStore.setState({ chatMessages: [] });
}

export async function joinLobby(
  settings: Partial<RoomSettings>,
  playerName: string,
): Promise<Room<LobbyRoomState>> {
  await leaveCurrentLobby();

  const client = getClient();
  // Always create a fresh room — joinOrCreate would merge into existing public lobbies.
  const room = await client.create<LobbyRoomState>(
    "lobby",
    {
      ...settings,
      hostName: playerName,
      name: playerName,
    },
    LobbyRoomState,
  );

  useNetworkStore.getState().setLobbyRoom(room);
  useNetworkStore.getState().setSessionId(room.sessionId);
  setupLobbyListeners(room);
  return room;
}

export async function joinLobbyById(
  roomId: string,
  playerName: string,
): Promise<Room<LobbyRoomState>> {
  await leaveCurrentLobby();

  const client = getClient();
  const room = await client.joinById<LobbyRoomState>(
    roomId,
    { name: playerName },
    LobbyRoomState,
  );
  useNetworkStore.getState().setLobbyRoom(room);
  useNetworkStore.getState().setSessionId(room.sessionId);
  setupLobbyListeners(room);
  return room;
}

function setupLobbyListeners(room: Room<LobbyRoomState>) {
  if (lobbyListenersAttached) return;
  lobbyListenersAttached = true;

  room.onLeave(() => {
    lobbyListenersAttached = false;
    const current = useNetworkStore.getState().lobbyRoom;
    if (current?.roomId === room.roomId) {
      useNetworkStore.getState().setLobbyRoom(null);
    }
  });

  room.onMessage(SERVER_MESSAGES.CHAT, (data) => {
    useNetworkStore.getState().addChatMessage(data);
  });

  room.onMessage(SERVER_MESSAGES.START_GAME, async (data: {
    gameRoomId: string;
    settings: Record<string, unknown>;
  }) => {
    lobbyListenersAttached = false;
    const client = getClient();
    const store = useNetworkStore.getState();
    const wasLobbyHost = store.sessionId === room.state.hostId;
    const playerName = store.playerName;

    try {
      const gameRoom = await client.joinById<GameState>(
        data.gameRoomId,
        {
          name: playerName,
          wasLobbyHost,
        },
        GameState,
      );
      await waitForLocalPlayer(gameRoom);
      store.setGameRoom(gameRoom);
      store.setSessionId(gameRoom.sessionId);
      setupGameListeners(gameRoom);
      window.dispatchEvent(new CustomEvent("meccha-enter-game"));

      try {
        await room.leave(true);
      } catch {
        // already disconnected
      }
      store.setLobbyRoom(null);
    } catch (e) {
      console.error("Failed to join game room:", e);
      alert("無法加入遊戲房間，請重試");
    }
  });
}

export async function createGameFromLobby(): Promise<Room<GameState> | null> {
  const lobby = useNetworkStore.getState().lobbyRoom;
  if (!lobby) return null;
  lobby.send(CLIENT_MESSAGES.START_GAME, {});
  return null;
}

export function setupGameListeners(room: Room<GameState>) {
  room.onMessage(SERVER_MESSAGES.PAINT_STROKE, (data: PaintStrokeMessage) => {
    useNetworkStore.getState().addRemoteStroke(data);
  });

  room.onMessage(SERVER_MESSAGES.CHAT, (data) => {
    useNetworkStore.getState().addChatMessage(data);
  });

  room.onMessage(SERVER_MESSAGES.ROUND_RESULT, (data) => {
    useNetworkStore.getState().setRoundResult(data.winner, data.snapshots);
  });

  room.onMessage(SERVER_MESSAGES.HIT, (_data) => {
    // handled via state sync
  });

  room.onMessage(SERVER_MESSAGES.WHISTLE, (data) => {
    window.dispatchEvent(new CustomEvent("meccha-whistle", { detail: data }));
  });

  room.onMessage(SERVER_MESSAGES.ERROR, (data) => {
    console.error("Server error:", data);
  });

  room.onStateChange((_state) => {
    const phase = room.state.phase;
    if (phase === "answerCheck") {
      import("../stores").then(({ useGameUIStore }) => {
        useGameUIStore.getState().setShowAnswerCheck(true);
        useGameUIStore.getState().setAnswerCheckIndex(0);
      });
    } else {
      import("../stores").then(({ useGameUIStore }) => {
        useGameUIStore.getState().setShowAnswerCheck(false);
      });
    }
    if (phase === "preparation") {
      useNetworkStore.getState().clearRemoteStrokes();
    }
  });
}

export async function fetchPublicRooms(): Promise<
  { roomId: string; metadata: Record<string, unknown> }[]
> {
  try {
    const base = import.meta.env.VITE_COLYSEUS_URL?.replace(/^ws/, "http") || "http://localhost:2567";
    const res = await fetch(`${base}/api/rooms`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const seen = new Set<string>();
    return data
      .filter((r: { roomId: string; metadata?: Record<string, unknown> }) => {
        if (seen.has(r.roomId)) return false;
        seen.add(r.roomId);
        const meta = r.metadata ?? {};
        if (meta.isPrivate) return false;
        const players = Number(meta.players ?? 0);
        const maxPlayers = Number(meta.maxPlayers ?? 10);
        return players > 0 && players < maxPlayers;
      })
      .map((r: { roomId: string; metadata?: Record<string, unknown> }) => ({
        roomId: r.roomId,
        metadata: r.metadata ?? {},
      }));
  } catch {
    return [];
  }
}

export async function fetchWorkshopMaps() {
  const res = await fetch("/api/workshop");
  if (!res.ok) return [];
  return res.json();
}
