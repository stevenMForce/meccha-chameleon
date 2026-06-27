import { useTranslation } from "react-i18next";
import { CLIENT_MESSAGES, type PoseId } from "@meccha/shared";
import { POSES } from "../game/characters/Poses";
import { useNetworkStore, useGameUIStore } from "../stores";
import { cn } from "../lib/utils";

export function PoseMenu() {
  const { t } = useTranslation();
  const open = useGameUIStore((s) => s.poseMenuOpen);
  const setOpen = useGameUIStore((s) => s.setPoseMenuOpen);
  const gameRoom = useNetworkStore((s) => s.gameRoom);

  if (!open) return null;

  const selectPose = (pose: PoseId) => {
    gameRoom?.send(CLIENT_MESSAGES.POSE_CHANGE, { pose });
    setOpen(false);
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex gap-2 p-3 rounded-xl bg-meccha-panel/95 border border-white/10 backdrop-blur">
      {POSES.map((pose) => (
        <button
          key={pose.id}
          onClick={() => selectPose(pose.id)}
          className={cn(
            "px-3 py-2 rounded-lg text-sm font-semibold transition",
            "bg-white/10 hover:bg-meccha-green hover:text-meccha-dark",
          )}
        >
          {t(pose.labelKey)}
        </button>
      ))}
      <button onClick={() => setOpen(false)} className="px-2 text-white/50">✕</button>
    </div>
  );
}
