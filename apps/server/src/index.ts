import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, matchMaker } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { LobbyRoom } from "./rooms/LobbyRoom.js";
import { GameRoom } from "./rooms/GameRoom.js";

const PORT = Number(process.env.PORT) || 2567;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/api/livekit/token", (_req, res) => {
  res.status(503).json({ error: "LiveKit not configured. Set LIVEKIT_API_KEY and LIVEKIT_API_SECRET." });
});

app.get("/api/rooms", async (_req, res) => {
  try {
    const rooms = await matchMaker.query({ name: "lobby" });
    res.json(
      rooms
        .filter((room) => {
          const meta = room.metadata ?? {};
          return !meta.isPrivate && (room.clients ?? 0) > 0;
        })
        .map((room) => ({
          roomId: room.roomId,
          metadata: {
            ...(room.metadata ?? {}),
            players: room.clients,
          },
        })),
    );
  } catch {
    res.json([]);
  }
});

app.get("/api/workshop", (_req, res) => {
  res.json([
    {
      id: "demo-map-1",
      name: "Starter Arena",
      author: "Meccha Team",
      thumbnail: "/maps/mansion-preview.png",
      downloads: 1200,
      mapUrl: "/maps/demo-arena.json",
      createdAt: "2026-06-01T00:00:00Z",
    },
  ]);
});

const httpServer = createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define("lobby", LobbyRoom).filterBy(["isPrivate"]);
gameServer.define("game", GameRoom);

httpServer.listen(PORT, () => {
  console.log(`Meccha Chameleon server listening on :${PORT}`);
});
