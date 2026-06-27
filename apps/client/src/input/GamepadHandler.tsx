import { useEffect, useRef } from "react";
import { useSettingsStore, usePaintStore, useGameUIStore } from "../stores";

export function GamepadHandler() {
  const keyBindings = useSettingsStore((s) => s.keyBindings);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const poll = () => {
      const pads = navigator.getGamepads();
      const pad = pads[0];
      if (pad) {
        const lx = pad.axes[0];
        const ly = pad.axes[1];
        if (Math.abs(lx) > 0.15 || Math.abs(ly) > 0.15) {
          window.dispatchEvent(
            new CustomEvent("meccha-gamepad-move", { detail: { x: lx, y: ly } }),
          );
        }
        if (pad.buttons[0]?.pressed) {
          window.dispatchEvent(new KeyboardEvent("keydown", { code: keyBindings.forward }));
        }
        if (pad.buttons[1]?.pressed) {
          usePaintStore.getState().setOpen(!usePaintStore.getState().isOpen);
        }
        if (pad.buttons[2]?.pressed) {
          useGameUIStore.getState().setPoseMenuOpen(true);
        }
      }
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [keyBindings]);

  return null;
}
