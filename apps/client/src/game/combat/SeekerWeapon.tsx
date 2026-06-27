import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CLIENT_MESSAGES } from "@meccha/shared";
import { useNetworkStore, useSettingsStore } from "../../stores";

interface SeekerWeaponProps {
  enabled: boolean;
}

export function SeekerWeapon({ enabled }: SeekerWeaponProps) {
  const { camera } = useThree();
  const cooldown = useRef(false);
  const gameRoom = useNetworkStore((s) => s.gameRoom);
  const shootKey = useSettingsStore((s) => s.keyBindings.shoot);

  useEffect(() => {
    if (!enabled) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || cooldown.current) return;
      cooldown.current = true;
      setTimeout(() => {
        cooldown.current = false;
      }, 800);

      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      const origin = camera.position.clone();

      gameRoom?.send(CLIENT_MESSAGES.SHOOT, {
        origin: { x: origin.x, y: origin.y, z: origin.z },
        direction: { x: direction.x, y: direction.y, z: direction.z },
        timestamp: Date.now(),
      });

      window.dispatchEvent(new CustomEvent("meccha-shoot", { detail: { origin, direction } }));
    };

    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [enabled, camera, gameRoom, shootKey]);

  return null;
}

export function ShotgunFX() {
  const flashRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = () => {
      const flash = document.createElement("div");
      flash.style.cssText =
        "position:fixed;inset:0;background:rgba(255,200,100,0.3);pointer-events:none;z-index:100;transition:opacity 0.1s";
      document.body.appendChild(flash);
      setTimeout(() => {
        flash.style.opacity = "0";
        setTimeout(() => flash.remove(), 100);
      }, 50);
    };
    window.addEventListener("meccha-shoot", handler);
    return () => window.removeEventListener("meccha-shoot", handler);
  }, []);

  return <div ref={flashRef} />;
}
