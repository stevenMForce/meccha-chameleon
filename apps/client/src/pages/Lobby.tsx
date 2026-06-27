import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MAP_NAMES,
  MODE_NAMES,
  CLIENT_MESSAGES,
  type MapId,
  type GameMode,
  roomSettingsSchema,
} from "@meccha/shared";
import { useNetworkStore } from "../stores";
import { leaveCurrentLobby } from "../network/client";
import { ChatPanel } from "../ui/ChatPanel";
import { LoadingScreen } from "../ui/LoadingScreen";

export function Lobby() {
  const { t } = useTranslation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const lobbyRoom = useNetworkStore((s) => s.lobbyRoom);
  const gameRoom = useNetworkStore((s) => s.gameRoom);
  const sessionId = useNetworkStore((s) => s.sessionId);
  const [, forceUpdate] = useReducerTick();

  useEffect(() => {
    if (gameRoom) {
      navigate("/play");
      return;
    }
    if (!lobbyRoom) {
      const timer = setTimeout(() => {
        const { lobbyRoom: lr, gameRoom: gr } = useNetworkStore.getState();
        if (!lr && !gr) navigate("/create");
      }, 800);
      return () => clearTimeout(timer);
    }

    lobbyRoom.onStateChange(() => forceUpdate());
  }, [lobbyRoom, gameRoom, navigate]);

  if (gameRoom) return <LoadingScreen message={t("common.loading")} />;
  if (!lobbyRoom) return <LoadingScreen message={t("common.loading")} />;

  const state = lobbyRoom.state;
  const isHost = sessionId === state.hostId;
  const players = Array.from(state.players.values());

  const updateHostSettings = (partial: Record<string, unknown>) => {
    if (!isHost) return;
    const merged = {
      mapId: state.mapId,
      mode: state.mode,
      prepDuration: state.prepDuration,
      huntDuration: state.huntDuration,
      whistleEnabled: state.whistleEnabled,
      whistleInterval: state.whistleInterval,
      maxPlayers: state.maxPlayers,
      isPrivate: state.isPrivate,
      roomName: state.roomName,
      ...partial,
    };
    const parsed = roomSettingsSchema.safeParse(merged);
    if (parsed.success) {
      lobbyRoom.send(CLIENT_MESSAGES.UPDATE_SETTINGS, parsed.data);
    }
  };

  const toggleReady = () => lobbyRoom.send(CLIENT_MESSAGES.READY, {});
  const startGame = () => lobbyRoom.send(CLIENT_MESSAGES.START_GAME, {});

  return (
    <div className="min-h-full flex">
      <div className="flex-1 p-8">
        <button
          onClick={() => {
            void leaveCurrentLobby().then(() => navigate("/"));
          }}
          className="text-white/60 mb-4 hover:text-white text-sm"
        >
          ← {t("common.back")}
        </button>
        <h1 className="text-2xl font-bold mb-2">{state.roomName}</h1>
        <p className="text-white/60 text-sm mb-6">Room: {roomId}</p>

        <div className="grid grid-cols-2 gap-4 max-w-md mb-8">
          {isHost && (
            <>
              <label className="block">
                <span className="text-xs text-white/60">{t("create.map")}</span>
                <select
                  value={state.mapId}
                  onChange={(e) => updateHostSettings({ mapId: e.target.value })}
                  className="w-full mt-1 px-2 py-1.5 rounded bg-white/10 text-sm"
                >
                  {(Object.keys(MAP_NAMES) as MapId[]).map((id) => (
                    <option key={id} value={id}>{MAP_NAMES[id]}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-white/60">{t("create.mode")}</span>
                <select
                  value={state.mode}
                  onChange={(e) => updateHostSettings({ mode: e.target.value })}
                  className="w-full mt-1 px-2 py-1.5 rounded bg-white/10 text-sm"
                >
                  {(Object.keys(MODE_NAMES) as GameMode[]).map((m) => (
                    <option key={m} value={m}>{MODE_NAMES[m]}</option>
                  ))}
                </select>
              </label>
            </>
          )}
          {!isHost && (
            <div className="col-span-2 text-sm text-white/60">
              {MAP_NAMES[state.mapId as MapId]} · {MODE_NAMES[state.mode as GameMode]}
            </div>
          )}
        </div>

        <h2 className="font-bold mb-3">{t("lobby.players")} ({players.length}/{state.maxPlayers})</h2>
        <ul className="space-y-2 mb-8">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/5"
            >
              <span>
                {p.name} {p.isHost && "👑"}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${p.isReady ? "bg-green-500/30" : "bg-white/10"}`}>
                {p.isReady ? t("lobby.ready") : t("lobby.notReady")}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex gap-3">
          <button
            onClick={toggleReady}
            className="px-6 py-3 rounded-xl bg-meccha-yellow text-meccha-dark font-bold"
          >
            {t("lobby.toggleReady")}
          </button>
          {isHost && (
            <button
              onClick={startGame}
              disabled={players.length < 2}
              className="px-6 py-3 rounded-xl bg-meccha-green text-meccha-dark font-bold disabled:opacity-50"
            >
              {t("lobby.startGame")}
            </button>
          )}
        </div>
      </div>

      <div className="w-80 border-l border-white/10 p-4">
        <ChatPanel embedded />
      </div>
    </div>
  );
}

function useReducerTick() {
  const [tick, setTick] = useState(0);
  return [tick, () => setTick((t) => t + 1)] as const;
}
