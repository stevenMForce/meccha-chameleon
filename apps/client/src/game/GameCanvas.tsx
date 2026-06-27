import { Suspense, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Sky, Environment, ContactShadows } from "@react-three/drei";
import type { MapId, PoseId } from "@meccha/shared";
import { MAP_DATA } from "@meccha/shared";
import { MapShell } from "./maps/MapShell";
import { PlayerController } from "./player/PlayerController";
import { RemotePlayer } from "./player/RemotePlayer";
import { BodyPaintHandler } from "./painting/BodyPaintHandler";
import { SeekerWeapon } from "./combat/SeekerWeapon";
import { AnswerCheckCamera } from "./camera/AnswerCheckCamera";
import { PaintEngine } from "./painting/PaintEngine";
import { useNetworkStore, useGameUIStore } from "../stores";

interface GameCanvasProps {
  mapId: MapId;
  phase: string;
  sessionId: string;
  role: string;
  pose: PoseId;
}

export function GameCanvas({ mapId, phase, sessionId, role, pose }: GameCanvasProps) {
  const paintEngine = useMemo(() => new PaintEngine(), []);
  const gameRoom = useNetworkStore((s) => s.gameRoom);
  const roundSnapshots = useNetworkStore((s) => s.roundSnapshots);
  const showAnswerCheck = useGameUIStore((s) => s.showAnswerCheck);
  const answerCheckIndex = useGameUIStore((s) => s.answerCheckIndex);
  const mapData = MAP_DATA[mapId];

  useEffect(() => {
    if (phase === "preparation") {
      paintEngine.reset();
    }
    return () => paintEngine.dispose();
  }, [phase, paintEngine]);

  const players = gameRoom?.state?.players;
  const remotePlayers = players
    ? Array.from(players.values()).filter((p) => p.id !== sessionId)
    : [];

  const spawn = mapData?.hiderSpawns[0] ?? { x: 0, y: 1, z: 0 };

  return (
    <Canvas
      shadows
      camera={{ position: [0, 3, 8], fov: 60, near: 0.1, far: 200 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={[mapData?.ambientColor ?? "#1a1a2e"]} />
      <ambientLight intensity={0.4} />
      <directionalLight
        castShadow
        position={[10, 15, 10]}
        intensity={1.2}
        shadow-mapSize={[2048, 2048]}
      />
      <Sky sunPosition={[10, 15, 10]} />
      <Environment preset="apartment" />

      <Suspense fallback={null}>
        <Physics gravity={[0, -20, 0]}>
          <MapShell mapId={mapId} />
          <PlayerController
            sessionId={sessionId}
            role={role}
            pose={pose}
            phase={phase}
            initialPosition={[spawn.x, spawn.y + 1, spawn.z]}
            paintEngine={paintEngine}
          />
          {remotePlayers.map((p) => (
            <RemotePlayer key={p.id} player={p} />
          ))}
        </Physics>
      </Suspense>

      <ContactShadows opacity={0.4} scale={40} blur={2} far={20} />

      <BodyPaintHandler
        paintEngine={paintEngine}
        enabled={
          role === "hider" &&
          (phase === "preparation" || phase === "hunt") &&
          !showAnswerCheck
        }
      />
      <SeekerWeapon enabled={role === "seeker" && phase === "hunt" && !showAnswerCheck} />
      <AnswerCheckCamera
        snapshots={roundSnapshots}
        currentIndex={answerCheckIndex}
        active={showAnswerCheck}
      />
    </Canvas>
  );
}
