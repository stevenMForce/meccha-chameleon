import { Schema, type, MapSchema } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("string") role: string = "hider";
  @type("string") pose: string = "stand";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  @type("number") rotationY: number = 0;
  @type("boolean") isAlive: boolean = true;
  @type("boolean") isReady: boolean = false;
  @type("number") kills: number = 0;
  @type("number") score: number = 0;
  @type("string") foundBy: string = "";
  @type("number") foundAt: number = 0;
  @type("number") paintVersion: number = 0;
  @type("boolean") isHost: boolean = false;
}

export class GameState extends Schema {
  @type("string") phase: string = "lobby";
  @type("string") mode: string = "normal";
  @type("string") mapId: string = "mansion";
  @type("number") timeRemaining: number = 0;
  @type("string") hostId: string = "";
  @type("number") roundNumber: number = 0;
  @type("boolean") whistleEnabled: boolean = false;
  @type("number") whistleInterval: number = 15;
  @type("number") prepDuration: number = 60;
  @type("number") huntDuration: number = 180;
  @type("number") maxPlayers: number = 10;
  @type("boolean") isPrivate: boolean = false;
  @type("string") roomName: string = "Meccha Room";
  @type("string") winnerTeam: string = "";
  @type("string") doublePhase: string = "";
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type("string") version: string = "0.1.0";
}

export class LobbyRoomState extends Schema {
  @type("string") hostId: string = "";
  @type("string") roomName: string = "Meccha Room";
  @type("string") mapId: string = "mansion";
  @type("string") mode: string = "normal";
  @type("number") prepDuration: number = 60;
  @type("number") huntDuration: number = 180;
  @type("boolean") whistleEnabled: boolean = false;
  @type("number") whistleInterval: number = 15;
  @type("number") maxPlayers: number = 10;
  @type("boolean") isPrivate: boolean = false;
  @type("string") phase: string = "lobby";
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type("string") version: string = "0.1.0";
}
