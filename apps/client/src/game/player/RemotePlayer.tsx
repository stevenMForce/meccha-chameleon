import { useMemo, useEffect } from "react";
import { useNetworkStore } from "../../stores";
import { PaintEngine } from "../painting/PaintEngine";
import { ChameleonCharacter } from "../characters/ChameleonCharacter";
import type { PlayerState, PoseId } from "@meccha/shared";

interface RemotePlayerProps {
  player: PlayerState;
}

export function RemotePlayer({ player }: RemotePlayerProps) {
  const remoteStrokes = useNetworkStore((s) => s.remoteStrokes);
  const paintEngine = useMemo(() => new PaintEngine(), []);

  useEffect(() => {
    for (const stroke of remoteStrokes) {
      if (stroke.playerId === player.id) {
        paintEngine.applyStroke(stroke);
      }
    }
  }, [remoteStrokes, player.id, paintEngine]);

  useEffect(() => () => paintEngine.dispose(), [paintEngine]);

  if (!player.isAlive && player.role === "hider") return null;

  return (
    <group position={[player.x, player.y, player.z]} rotation={[0, player.rotationY, 0]}>
      <ChameleonCharacter
        playerId={player.id}
        pose={player.pose as PoseId}
        paintEngine={paintEngine}
        name={player.name}
        role={player.role}
      />
    </group>
  );
}
