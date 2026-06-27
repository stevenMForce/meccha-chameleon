import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MAP_NAMES, MODE_NAMES, type MapId, type GameMode } from "@meccha/shared";
import { useNetworkStore } from "../stores";
import { fetchPublicRooms, joinLobbyById } from "../network/client";

export function ServerBrowser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const playerName = useNetworkStore((s) => s.playerName);
  const setPlayerName = useNetworkStore((s) => s.setPlayerName);
  const [rooms, setRooms] = useState<{ roomId: string; metadata: Record<string, unknown> }[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchPublicRooms().then(setRooms).finally(() => setLoading(false));
    const interval = setInterval(() => fetchPublicRooms().then(setRooms), 5000);
    return () => clearInterval(interval);
  }, []);

  const join = async (roomId: string) => {
    if (!playerName.trim()) return;
    setJoining(true);
    try {
      const room = await joinLobbyById(roomId, playerName.trim());
      navigate(`/room/${room.roomId}`);
    } catch (e) {
      alert(String(e));
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-full p-8 max-w-2xl mx-auto">
      <button onClick={() => navigate("/")} className="text-white/60 mb-6 hover:text-white">
        ← {t("common.back")}
      </button>
      <h1 className="text-2xl font-bold mb-6">{t("browse.title")}</h1>

      <label className="block mb-6">
        <span className="text-sm text-white/60">{t("create.playerName")}</span>
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-white/10 outline-none"
        />
      </label>

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : rooms.length === 0 ? (
        <p className="text-white/60">{t("browse.empty")}</p>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <div
              key={room.roomId}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div>
                <p className="font-bold">{String(room.metadata.roomName ?? "Room")}</p>
                <p className="text-sm text-white/60">
                  {MAP_NAMES[room.metadata.mapId as MapId] ?? room.metadata.mapId} ·{" "}
                  {MODE_NAMES[room.metadata.mode as GameMode] ?? room.metadata.mode} ·{" "}
                  {String(room.metadata.players ?? 0)}/{String(room.metadata.maxPlayers ?? 10)}
                </p>
              </div>
              <button
                onClick={() => join(room.roomId)}
                disabled={joining || !playerName.trim()}
                className="px-4 py-2 rounded-lg bg-meccha-green text-meccha-dark font-bold text-sm disabled:opacity-50"
              >
                {joining ? t("common.loading") : t("browse.join")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
