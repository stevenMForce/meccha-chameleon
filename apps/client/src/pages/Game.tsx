import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { MapId, PoseId } from "@meccha/shared";
import { useNetworkStore } from "../stores";
import { setupGameListeners } from "../network/client";
import { GameCanvas } from "../game/GameCanvas";
import { GameHUD } from "../ui/GameHUD";
import { ShotgunFX } from "../game/combat/SeekerWeapon";
import { VoiceChat } from "../voice/VoiceChat";
import { GamepadHandler } from "../input/GamepadHandler";
import { WhistleHandler } from "../audio/WhistleHandler";
import { LoadingScreen } from "../ui/LoadingScreen";

export function Game() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const gameRoom = useNetworkStore((s) => s.gameRoom);
  const sessionId = useNetworkStore((s) => s.sessionId);
  const [, forceUpdate] = useReducerState();

  useEffect(() => {
    if (!gameRoom) {
      const timer = setTimeout(() => {
        if (!useNetworkStore.getState().gameRoom) navigate("/");
      }, 1500);
      return () => clearTimeout(timer);
    }
    setupGameListeners(gameRoom);
    gameRoom.onStateChange(() => forceUpdate());
  }, [gameRoom, navigate]);

  if (!gameRoom) return <LoadingScreen message={t("common.loading")} />;

  const state = gameRoom.state;
  if (!state?.players) {
    return <LoadingScreen message={t("common.loading")} />;
  }

  const localPlayer = state.players.get(sessionId);
  if (!localPlayer) {
    return <LoadingScreen message={t("common.loading")} />;
  }

  return (
    <div className="relative w-full h-full">
      <GameCanvas
        mapId={state.mapId as MapId}
        phase={state.phase}
        sessionId={sessionId}
        role={localPlayer.role}
        pose={localPlayer.pose as PoseId}
      />
      <GameHUD
        gameState={state}
        sessionId={sessionId}
        isHost={sessionId === state.hostId}
      />
      <ShotgunFX />
      <VoiceChat roomId={gameRoom.roomId} />
      <GamepadHandler />
      <WhistleHandler />
    </div>
  );
}

function useReducerState() {
  const [tick, setTick] = useState(0);
  return [tick, () => setTick((t) => t + 1)] as const;
}
