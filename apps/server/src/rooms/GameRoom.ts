import { Room, Client } from "colyseus";
import {
  GameState,
  PlayerState,
  CLIENT_MESSAGES,
  SERVER_MESSAGES,
  paintStrokeSchema,
  poseChangeSchema,
  shootSchema,
  playerMoveSchema,
  chatMessageSchema,
  MAP_DATA,
  type RevealSnapshot,
  type TeamId,
  type GamePhase,
} from "@meccha/shared";
import { RoundManager } from "../systems/RoundManager.js";
import { HitDetection } from "../systems/HitDetection.js";

interface GameRoomOptions {
  hostName?: string;
  roomName?: string;
  mapId?: string;
  mode?: string;
  prepDuration?: number;
  huntDuration?: number;
  whistleEnabled?: boolean;
  whistleInterval?: number;
  maxPlayers?: number;
}

export class GameRoom extends Room<GameState> {
  private roundManager!: RoundManager;
  private hitDetection = new HitDetection();
  private strokeCounts = new Map<string, { count: number; resetAt: number }>();
  private lobbyHostName = "";
  private hostAssigned = false;
  private gameStarted = false;

  onCreate(options: GameRoomOptions) {
    this.lobbyHostName = options.hostName ?? "Host";
    this.setState(new GameState());
    this.state.hostId = "";
    this.state.roomName = options.roomName ?? "Meccha Room";
    this.state.mapId = options.mapId ?? "mansion";
    this.state.mode = options.mode ?? "normal";
    this.state.prepDuration = options.prepDuration ?? 60;
    this.state.huntDuration = options.huntDuration ?? 180;
    this.state.whistleEnabled = options.whistleEnabled ?? false;
    this.state.whistleInterval = options.whistleInterval ?? 15;
    this.state.maxPlayers = options.maxPlayers ?? 10;
    this.maxClients = this.state.maxPlayers;
    this.autoDispose = true;

    this.roundManager = new RoundManager(this.state, {
      onPhaseChange: (phase: GamePhase) => {
        if (phase === "preparation" || phase === "hunt") {
          this.teleportPlayersToSpawns(phase === "preparation" ? "hider" : undefined);
        }
      },
      onRoundResult: (winner: TeamId | "draw", snapshots: RevealSnapshot[]) => {
        this.broadcast(SERVER_MESSAGES.ROUND_RESULT, { winner, snapshots });
      },
      onWhistle: (playerId: string) => {
        this.broadcast(SERVER_MESSAGES.WHISTLE, { playerId });
      },
    });

    this.registerMessages();
  }

  onJoin(client: Client, options: { name?: string; wasLobbyHost?: boolean }) {
    if (this.state.players.has(client.sessionId)) return;

    const player = new PlayerState();
    player.id = client.sessionId;
    player.name = options.name?.slice(0, 20) || `Player ${this.state.players.size + 1}`;

    const shouldBeHost =
      options.wasLobbyHost ||
      (!this.hostAssigned && player.name === this.lobbyHostName);

    if (shouldBeHost && !this.hostAssigned) {
      this.hostAssigned = true;
      this.state.hostId = client.sessionId;
      player.isHost = true;
    }

    this.state.players.set(client.sessionId, player);
    this.spawnPlayer(player);

    if (this.state.players.size >= 2 && !this.gameStarted) {
      this.tryAutoStart();
    }
  }

  onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.isAlive = false;
    }
    if (client.sessionId === this.state.hostId && this.state.players.size > 1) {
      const next = Array.from(this.state.players.values()).find(
        (p) => p.id !== client.sessionId,
      );
      if (next) {
        next.isHost = true;
        this.state.hostId = next.id;
        this.hostAssigned = true;
      }
    }
  }

  private tryAutoStart() {
    if (this.gameStarted || this.state.players.size < 2) return;
    this.gameStarted = true;
    this.clock.setTimeout(() => {
      if (this.state.phase === "lobby") {
        this.roundManager.startGame();
      }
    }, 1500);
  }

  private registerMessages() {
    this.onMessage(CLIENT_MESSAGES.START_GAME, (client) => {
      if (client.sessionId !== this.state.hostId) return;
      if (this.state.players.size < 2) return;
      if (this.state.phase !== "lobby") return;
      this.gameStarted = true;
      this.roundManager.startGame();
    });

    this.onMessage(CLIENT_MESSAGES.NEXT_ROUND, (client) => {
      if (client.sessionId !== this.state.hostId) return;
      this.roundManager.nextRound();
    });

    this.onMessage(CLIENT_MESSAGES.RETURN_LOBBY, (client) => {
      if (client.sessionId !== this.state.hostId) return;
      this.roundManager.returnToLobby();
    });

    this.onMessage(CLIENT_MESSAGES.MOVE, (client, data: unknown) => {
      const parsed = playerMoveSchema.safeParse(data);
      if (!parsed.success) return;
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.x = parsed.data.x;
      player.y = parsed.data.y;
      player.z = parsed.data.z;
      player.rotationY = parsed.data.rotationY;
    });

    this.onMessage(CLIENT_MESSAGES.POSE_CHANGE, (client, data: unknown) => {
      const parsed = poseChangeSchema.safeParse(data);
      if (!parsed.success) return;
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.pose = parsed.data.pose;
    });

    this.onMessage(CLIENT_MESSAGES.PAINT_STROKE, (client, data: unknown) => {
      if (!this.rateLimitStroke(client.sessionId)) return;
      const parsed = paintStrokeSchema.safeParse(data);
      if (!parsed.success) return;
      parsed.data.playerId = client.sessionId;
      this.broadcast(SERVER_MESSAGES.PAINT_STROKE, parsed.data, { except: client });
    });

    this.onMessage(CLIENT_MESSAGES.PAINT_SNAPSHOT, (client, data: unknown) => {
      this.broadcast(SERVER_MESSAGES.PAINT_SNAPSHOT, data, { except: client });
    });

    this.onMessage(CLIENT_MESSAGES.SHOOT, (client, data: unknown) => {
      const parsed = shootSchema.safeParse(data);
      if (!parsed.success) return;
      const targetId = this.hitDetection.validateShot(this.state, client.sessionId, parsed.data);
      if (targetId) {
        this.roundManager.handlePlayerFound(client.sessionId, targetId);
        this.broadcast(SERVER_MESSAGES.HIT, {
          seekerId: client.sessionId,
          hiderId: targetId,
        });
      }
    });

    this.onMessage(CLIENT_MESSAGES.CHAT, (client, data: unknown) => {
      const parsed = chatMessageSchema.safeParse(data);
      if (!parsed.success) return;
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      this.broadcast(SERVER_MESSAGES.CHAT, {
        playerId: client.sessionId,
        playerName: player.name,
        text: parsed.data.text,
        timestamp: Date.now(),
      });
    });

    this.onMessage(CLIENT_MESSAGES.WHISTLE, (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.role !== "hider" || !player.isAlive) return;
      this.broadcast(SERVER_MESSAGES.WHISTLE, { playerId: client.sessionId });
    });
  }

  private rateLimitStroke(playerId: string): boolean {
    const now = Date.now();
    let entry = this.strokeCounts.get(playerId);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + 1000 };
      this.strokeCounts.set(playerId, entry);
    }
    entry.count += 1;
    return entry.count <= 20;
  }

  private spawnPlayer(player: PlayerState) {
    const mapData = MAP_DATA[this.state.mapId as keyof typeof MAP_DATA];
    const spawns = mapData?.hiderSpawns ?? [{ x: 0, y: 0, z: 0 }];
    const spawn = spawns[Math.floor(Math.random() * spawns.length)];
    player.x = spawn.x;
    player.y = spawn.y;
    player.z = spawn.z;
  }

  private teleportPlayersToSpawns(roleFilter?: string) {
    const mapData = MAP_DATA[this.state.mapId as keyof typeof MAP_DATA];
    if (!mapData) return;

    let hiderIdx = 0;
    let seekerIdx = 0;

    for (const player of this.state.players.values()) {
      if (roleFilter && player.role !== roleFilter && player.role === "seeker") {
        const spawn = mapData.seekerSpawns[seekerIdx % mapData.seekerSpawns.length];
        player.x = spawn.x;
        player.y = spawn.y;
        player.z = spawn.z;
        seekerIdx++;
      } else if (player.role === "hider") {
        const spawn = mapData.hiderSpawns[hiderIdx % mapData.hiderSpawns.length];
        player.x = spawn.x;
        player.y = spawn.y;
        player.z = spawn.z;
        hiderIdx++;
      } else if (player.role === "seeker") {
        const spawn = mapData.seekerSpawns[seekerIdx % mapData.seekerSpawns.length];
        player.x = spawn.x;
        player.y = spawn.y;
        player.z = spawn.z;
        seekerIdx++;
      }
    }
  }

  onDispose() {
    this.roundManager.destroy();
  }
}
