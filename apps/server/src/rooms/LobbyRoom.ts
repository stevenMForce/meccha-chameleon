import { Room, Client, matchMaker } from "colyseus";
import {
  LobbyRoomState,
  PlayerState,
  CLIENT_MESSAGES,
  SERVER_MESSAGES,
  roomSettingsSchema,
  GAME_VERSION,
  type RoomSettingsPayload,
} from "@meccha/shared";

export class LobbyRoom extends Room<LobbyRoomState> {
  maxClients = 10;
  autoDispose = true;

  onCreate(options: Partial<RoomSettingsPayload> & { hostName?: string }) {
    this.setState(new LobbyRoomState());
    this.state.version = GAME_VERSION;
    this.state.roomName = options.roomName ?? "Meccha Room";
    this.state.mapId = options.mapId ?? "mansion";
    this.state.mode = options.mode ?? "normal";
    this.state.prepDuration = options.prepDuration ?? 60;
    this.state.huntDuration = options.huntDuration ?? 180;
    this.state.whistleEnabled = options.whistleEnabled ?? false;
    this.state.whistleInterval = options.whistleInterval ?? 15;
    this.state.maxPlayers = options.maxPlayers ?? 10;
    this.state.isPrivate = options.isPrivate ?? false;
    this.maxClients = this.state.maxPlayers;

    if (!this.state.isPrivate) {
      this.setMetadata({
        roomName: this.state.roomName,
        mapId: this.state.mapId,
        mode: this.state.mode,
        players: 0,
        maxPlayers: this.state.maxPlayers,
        isPrivate: false,
      });
    }

    this.onMessage(CLIENT_MESSAGES.READY, (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) player.isReady = !player.isReady;
    });

    this.onMessage(CLIENT_MESSAGES.UPDATE_SETTINGS, (client, data: unknown) => {
      if (client.sessionId !== this.state.hostId) return;
      const parsed = roomSettingsSchema.safeParse(data);
      if (!parsed.success) return;
      const s = parsed.data;
      this.state.roomName = s.roomName;
      this.state.mapId = s.mapId;
      this.state.mode = s.mode;
      this.state.prepDuration = s.prepDuration;
      this.state.huntDuration = s.huntDuration;
      this.state.whistleEnabled = s.whistleEnabled;
      this.state.whistleInterval = s.whistleInterval;
      this.state.maxPlayers = s.maxPlayers;
      this.state.isPrivate = s.isPrivate;
      this.maxClients = s.maxPlayers;
      this.updateMetadata();
    });

    this.onMessage(CLIENT_MESSAGES.START_GAME, async (client) => {
      if (client.sessionId !== this.state.hostId) return;
      const allReady = Array.from(this.state.players.values()).every((p) => p.isReady || p.isHost);
      if (!allReady || this.state.players.size < 2) return;

      const hostPlayer = this.state.players.get(this.state.hostId);
      const gameRoom = await matchMaker.createRoom("game", {
        hostName: hostPlayer?.name ?? "Host",
        roomName: this.state.roomName,
        mapId: this.state.mapId,
        mode: this.state.mode,
        prepDuration: this.state.prepDuration,
        huntDuration: this.state.huntDuration,
        whistleEnabled: this.state.whistleEnabled,
        whistleInterval: this.state.whistleInterval,
        maxPlayers: this.state.maxPlayers,
      });

      this.broadcast(SERVER_MESSAGES.START_GAME, {
        gameRoomId: gameRoom.roomId,
        settings: {
          roomName: this.state.roomName,
          mapId: this.state.mapId,
          mode: this.state.mode,
          prepDuration: this.state.prepDuration,
          huntDuration: this.state.huntDuration,
          whistleEnabled: this.state.whistleEnabled,
          whistleInterval: this.state.whistleInterval,
          maxPlayers: this.state.maxPlayers,
          isPrivate: this.state.isPrivate,
        },
      });
    });

    this.onMessage(CLIENT_MESSAGES.CHAT, (client, data: { text: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !data.text?.trim()) return;
      this.broadcast(SERVER_MESSAGES.CHAT, {
        playerId: client.sessionId,
        playerName: player.name,
        text: data.text.slice(0, 200),
        timestamp: Date.now(),
      });
    });
  }

  onJoin(client: Client, options: { name?: string }) {
    if (this.state.players.has(client.sessionId)) {
      return;
    }

    const player = new PlayerState();
    player.id = client.sessionId;
    player.name = options.name?.slice(0, 20) || `Player ${this.state.players.size + 1}`;
    player.isHost = this.state.players.size === 0;
    if (player.isHost) this.state.hostId = client.sessionId;
    this.state.players.set(client.sessionId, player);
    this.updateMetadata();
  }

  onLeave(client: Client) {
    const wasHost = client.sessionId === this.state.hostId;
    this.state.players.delete(client.sessionId);
    if (wasHost && this.state.players.size > 0) {
      const next = this.state.players.values().next().value;
      if (next) {
        next.isHost = true;
        this.state.hostId = next.id;
      }
    }
    this.updateMetadata();
  }

  private updateMetadata() {
    if (!this.state.isPrivate) {
      this.setMetadata({
        roomName: this.state.roomName,
        mapId: this.state.mapId,
        mode: this.state.mode,
        players: this.state.players.size,
        maxPlayers: this.state.maxPlayers,
        isPrivate: false,
      });
    }
  }
}
