import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CLIENT_MESSAGES } from "@meccha/shared";
import { PaintEngine, sampleColorFromMaterial } from "../painting/PaintEngine";
import { useNetworkStore, usePaintStore } from "../../stores";

interface BodyPaintHandlerProps {
  paintEngine: PaintEngine;
  enabled: boolean;
}

export function BodyPaintHandler({ paintEngine, enabled }: BodyPaintHandlerProps) {
  const { camera, scene, gl } = useThree();
  const isPainting = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const gameRoom = useNetworkStore((s) => s.gameRoom);

  useEffect(() => {
    if (!enabled) return;

    const onMouseDown = (e: MouseEvent) => {
      const tool = usePaintStore.getState().activeTool;
      if (tool === "brush" || tool === "fill" || tool === "clear") {
        isPainting.current = true;
        handlePaint(e);
      }
    };
    const onMouseUp = () => {
      isPainting.current = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isPainting.current) return;
      handlePaint(e);
    };

    const handlePaint = (e: MouseEvent) => {
      const tool = usePaintStore.getState().activeTool;
      const color = usePaintStore.getState().currentColor;
      const brushSize = usePaintStore.getState().brushSize;

      mouse.current.x = (e.clientX / gl.domElement.clientWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / gl.domElement.clientHeight) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const hits = raycaster.current.intersectObjects(scene.children, true);

      for (const hit of hits) {
        if (hit.object.userData?.isPaintTarget || hit.object.userData?.part) {
          if (tool === "eyedropper") {
            const mat = (hit.object as THREE.Mesh).material as THREE.MeshStandardMaterial;
            if (mat) {
              const hex = sampleColorFromMaterial(mat, hit.uv);
              usePaintStore.getState().setColor({ hex });
            }
            return;
          }

          const uv = hit.uv;
          if (!uv) continue;

          const stroke = paintEngine.paintAtUV(uv.x, uv.y, color, brushSize, tool);
          if (stroke) {
            stroke.playerId = useNetworkStore.getState().sessionId;
            gameRoom?.send(CLIENT_MESSAGES.PAINT_STROKE, stroke);
          }
          return;
        }

        if (tool === "eyedropper") {
          const mat = (hit.object as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat) {
            const hex = sampleColorFromMaterial(mat, hit.uv);
            usePaintStore.getState().setColor({ hex });
          }
          return;
        }
      }
    };

    gl.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    gl.domElement.addEventListener("mousemove", onMouseMove);

    return () => {
      gl.domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      gl.domElement.removeEventListener("mousemove", onMouseMove);
    };
  }, [enabled, camera, scene, gl, paintEngine, gameRoom]);

  return null;
}
