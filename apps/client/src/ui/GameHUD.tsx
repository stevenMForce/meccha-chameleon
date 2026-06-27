import { useTranslation } from "react-i18next";
import type { GameState } from "@meccha/shared";
import { MODE_NAMES } from "@meccha/shared";
import { CLIENT_MESSAGES } from "@meccha/shared";
import { useNetworkStore, useGameUIStore, usePaintStore } from "../stores";
import { PaintMenu } from "./PaintMenu";
import { PoseMenu } from "./PoseMenu";
import { AnswerCheck } from "./AnswerCheck";
import { ChatPanel } from "./ChatPanel";
import { cn } from "../lib/utils";

interface GameHUDProps {
  gameState: GameState;
  sessionId: string;
  isHost: boolean;
}

export function GameHUD({ gameState, sessionId, isHost }: GameHUDProps) {
  const { t } = useTranslation();
  const gameRoom = useNetworkStore((s) => s.gameRoom);
  const chatOpen = useGameUIStore((s) => s.chatOpen);
  const setChatOpen = useGameUIStore((s) => s.setChatOpen);
  const setPoseMenuOpen = useGameUIStore((s) => s.setPoseMenuOpen);
  const poseMenuOpen = useGameUIStore((s) => s.poseMenuOpen);
  const setPaintOpen = usePaintStore((s) => s.setOpen);

  const localPlayer = gameState.players.get(sessionId);
  const hidersAlive = Array.from(gameState.players.values()).filter(
    (p) => p.role === "hider" && p.isAlive,
  ).length;
  const seekersCount = Array.from(gameState.players.values()).filter(
    (p) => p.role === "seeker",
  ).length;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-30 p-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <div className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur border border-white/10">
            <p className="text-xs text-white/60 uppercase">{t(`phase.${gameState.phase}`)}</p>
            <p className="text-2xl font-bold text-meccha-yellow tabular-nums">
              {formatTime(gameState.timeRemaining)}
            </p>
          </div>
        </div>

        <div className="pointer-events-auto text-right">
          <p className="text-sm font-semibold">{MODE_NAMES[gameState.mode as keyof typeof MODE_NAMES]}</p>
          <p className="text-xs text-white/60">
            {t("hud.hiders")}: {hidersAlive} | {t("hud.seekers")}: {seekersCount}
          </p>
          {localPlayer && (
            <span
              className={cn(
                "inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold",
                localPlayer.role === "seeker" ? "bg-red-500/80" : "bg-green-500/80",
              )}
            >
              {t(`role.${localPlayer.role}`)}
            </span>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-4 z-30 flex gap-2 pointer-events-auto">
        {localPlayer?.role === "hider" && (
          <>
            <button
              onClick={() => setPaintOpen(true)}
              className="px-4 py-2 rounded-lg bg-meccha-green text-meccha-dark font-bold text-sm"
            >
              {t("hud.paint")} (F)
            </button>
            <button
              onClick={() => setPoseMenuOpen(!poseMenuOpen)}
              className="px-4 py-2 rounded-lg bg-meccha-yellow text-meccha-dark font-bold text-sm"
            >
              {t("hud.pose")} (Q)
            </button>
          </>
        )}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="px-4 py-2 rounded-lg bg-white/10 font-bold text-sm hover:bg-white/20"
        >
          {t("hud.chat")}
        </button>
      </div>

      {gameState.phase === "roundEnd" && isHost && (
        <div className="fixed bottom-4 right-4 z-30 flex gap-2 pointer-events-auto">
          <button
            onClick={() => gameRoom?.send(CLIENT_MESSAGES.NEXT_ROUND, {})}
            className="px-4 py-2 rounded-lg bg-meccha-green text-meccha-dark font-bold"
          >
            {t("hud.nextRound")}
          </button>
          <button
            onClick={() => gameRoom?.send(CLIENT_MESSAGES.RETURN_LOBBY, {})}
            className="px-4 py-2 rounded-lg bg-white/10 font-bold hover:bg-white/20"
          >
            {t("hud.returnLobby")}
          </button>
        </div>
      )}

      {gameState.phase === "lobby" && isHost && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            onClick={() => gameRoom?.send(CLIENT_MESSAGES.START_GAME, {})}
            className="px-8 py-3 rounded-xl bg-meccha-pink text-white font-bold text-lg shadow-lg hover:scale-105 transition"
          >
            {t("lobby.startGame")}
          </button>
        </div>
      )}

      <PaintMenu />
      <PoseMenu />
      <AnswerCheck />
      {chatOpen && <ChatPanel />}
    </>
  );
}
