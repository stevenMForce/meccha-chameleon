import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MAP_NAMES, MODE_NAMES, type MapId, type GameMode } from "@meccha/shared";
import { useNetworkStore, useLobbySettingsStore } from "../stores";
import { joinLobby } from "../network/client";

export function CreateRoom() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const playerName = useNetworkStore((s) => s.playerName);
  const setPlayerName = useNetworkStore((s) => s.setPlayerName);
  const settings = useLobbySettingsStore((s) => s.settings);
  const updateSettings = useLobbySettingsStore((s) => s.updateSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    setLoading(true);
    setError("");
    try {
      const room = await joinLobby(settings, playerName);
      navigate(`/room/${room.roomId}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : e instanceof ProgressEvent ? "無法連線至遊戲伺服器，請確認 server 已啟動 (port 2567)" : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full p-8 max-w-lg mx-auto">
      <button onClick={() => navigate("/")} className="text-white/60 mb-6 hover:text-white">
        ← {t("common.back")}
      </button>
      <h1 className="text-2xl font-bold mb-6">{t("create.title")}</h1>

      <label className="block mb-4">
        <span className="text-sm text-white/60">{t("create.playerName")}</span>
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-white/10 outline-none"
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm text-white/60">{t("create.roomName")}</span>
        <input
          value={settings.roomName}
          onChange={(e) => updateSettings({ roomName: e.target.value })}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-white/10 outline-none"
        />
      </label>

      <label className="block mb-4">
        <span className="text-sm text-white/60">{t("create.map")}</span>
        <select
          value={settings.mapId}
          onChange={(e) => updateSettings({ mapId: e.target.value as MapId })}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-white/10 outline-none"
        >
          {(Object.keys(MAP_NAMES) as MapId[]).map((id) => (
            <option key={id} value={id}>{MAP_NAMES[id]}</option>
          ))}
        </select>
      </label>

      <label className="block mb-4">
        <span className="text-sm text-white/60">{t("create.mode")}</span>
        <select
          value={settings.mode}
          onChange={(e) => updateSettings({ mode: e.target.value as GameMode })}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-white/10 outline-none"
        >
          {(Object.keys(MODE_NAMES) as GameMode[]).map((m) => (
            <option key={m} value={m}>{MODE_NAMES[m]}</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={settings.isPrivate}
          onChange={(e) => updateSettings({ isPrivate: e.target.checked })}
        />
        <span className="text-sm">{t("create.private")}</span>
      </label>

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={settings.whistleEnabled}
          onChange={(e) => updateSettings({ whistleEnabled: e.target.checked })}
        />
        <span className="text-sm">{t("create.whistle")}</span>
      </label>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button
        onClick={create}
        disabled={loading || !playerName.trim()}
        className="w-full py-3 rounded-xl bg-meccha-green text-meccha-dark font-bold disabled:opacity-50"
      >
        {loading ? t("common.loading") : t("create.create")}
      </button>
    </div>
  );
}
